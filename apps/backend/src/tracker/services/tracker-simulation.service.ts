import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { Coordinate, TrackingEvents } from '@livetracking/shared';
import { TrackerService } from './tracker.service';
import { TrackerGateway } from '../gateways/tracker.gateway';
import { trackingRooms } from '../constants/tracking-rooms';

@Injectable()
export class TrackerSimulationService implements OnModuleDestroy {
  private simulationIntervals: Map<string, NodeJS.Timeout> = new Map();
  private simulationActive = false;
  private readonly SIMULATION_COUNT = 10;
  private readonly BASE_COORDINATE = { lat: -6.2, lng: 106.8 };
  private readonly COORDINATE_VARIANCE = 0.1; // ~11km radius

  constructor(
    @Inject(forwardRef(() => TrackerService))
    private trackerService: TrackerService,

    private readonly trackerGateway: TrackerGateway,
  ) {}
  async onModuleDestroy() {
    await this.stopSimulation();
  }

  async startSimulation(): Promise<void> {
    if (this.simulationActive) {
      return;
    }

    this.simulationActive = true;
    await this.createSimulationTrackers();
  }

  async stopSimulation(): Promise<void> {
    if (!this.simulationActive) {
      return;
    }

    this.simulationActive = false;
    this.clearAllIntervals();
    await this.removeSimulationTrackers();
  }

  isSimulationActive(): boolean {
    return this.simulationActive;
  }

  private async createSimulationTrackers(): Promise<void> {
    for (let i = 1; i <= this.SIMULATION_COUNT; i++) {
      const coordinate = this.generateRandomCoordinate();
      const tracker = await this.trackerService.addTracker(
        i + 1000, // Using unique user IDs for simulation
        {
          name: `Secret Agent ${i}`,
          socketClientId: `simulation-client-${i}`,
          lastLat: coordinate.lat,
          lastLng: coordinate.lng,
          lastLocationName: 'Unknown Location',
          userId: i + 1000,
        },
      );

      this.trackerGateway.server
        .to(trackingRooms.SUBSCRIBED)
        .emit(TrackingEvents.TRACKER_REGISTERED, tracker);

      void this.startLocationUpdateSimulation(tracker.id);
      this.startOnlineStatusSimulation(tracker.id);
    }
  }

  private generateRandomCoordinate(): Coordinate {
    return {
      lat:
        this.BASE_COORDINATE.lat +
        (Math.random() - 0.5) * this.COORDINATE_VARIANCE,
      lng:
        this.BASE_COORDINATE.lng +
        (Math.random() - 0.5) * this.COORDINATE_VARIANCE,
    };
  }

  private async startLocationUpdateSimulation(
    trackerId: number,
  ): Promise<void> {
    const updateLocation = async () => {
      if (!this.simulationActive) return;

      try {
        const trackers = await this.trackerService.getAllTrackers();
        const tracker = trackers.find((t) => t.id === trackerId);
        if (!tracker || !tracker.isOnline) return;

        const newCoordinate = this.generateRandomCoordinate();
        const updatedTracker = await this.trackerService.updateLocation(
          trackerId,
          newCoordinate,
        );

        this.trackerGateway.server
          .to(trackingRooms.SUBSCRIBED)
          .emit(TrackingEvents.TRACKER_UPDATED, updatedTracker);
      } catch (error) {
        // Tracker might have been removed, ignore error
        console.warn(
          `Failed to update location for tracker ${trackerId}:`,
          error.message,
        );
      }

      if (this.simulationActive) {
        const nextUpdateDelay = Math.random() * 5000 + 2000; // 2-7 seconds
        const timeoutId = setTimeout(() => {
          updateLocation().catch((error) => {
            console.warn(
              `Location update failed for tracker ${trackerId}:`,
              error.message,
            );
          });
        }, nextUpdateDelay);
        this.simulationIntervals.set(`location-${trackerId}`, timeoutId);
      }
    };

    await updateLocation();
  }

  private startOnlineStatusSimulation(trackerId: number): void {
    const toggleStatus = async () => {
      if (!this.simulationActive) return;
      try {
        const trackers = await this.trackerService.getAllTrackers();
        const tracker = trackers.find((t) => t.id === trackerId);
        if (!tracker) return;

        if (tracker.isOnline) {
          const stoppedTracker =
            await this.trackerService.stopTracker(trackerId);
          this.trackerGateway.server
            .to(trackingRooms.SUBSCRIBED)
            .emit(TrackingEvents.TRACKER_STOPPED, stoppedTracker);
        } else {
          const updatedTracker = await this.trackerService.updateLocation(
            trackerId,
            this.generateRandomCoordinate(),
          );
          this.trackerGateway.server
            .to(trackingRooms.SUBSCRIBED)
            .emit(TrackingEvents.TRACKER_UPDATED, updatedTracker);
        }
      } catch (error) {
        // Tracker might have been removed, ignore error
        console.warn(
          `Failed to toggle status for tracker ${trackerId}:`,
          error.message,
        );
      }

      if (this.simulationActive) {
        const nextStatusDelay = Math.random() * 30000 + 75000;
        const timeoutId = setTimeout(() => {
          toggleStatus().catch((error) => {
            console.warn(
              `Status toggle failed for tracker ${trackerId}:`,
              error.message,
            );
          });
        }, nextStatusDelay);
        this.simulationIntervals.set(`status-${trackerId}`, timeoutId);
      }
    };

    const initialDelay = Math.random() * 60000 + 120000; // 2-3 minutes
    const timeoutId = setTimeout(() => {
      toggleStatus().catch((error) => {
        console.warn(
          `Initial status toggle failed for tracker ${trackerId}:`,
          error.message,
        );
      });
    }, initialDelay);
    this.simulationIntervals.set(`status-${trackerId}`, timeoutId);
  }

  private clearAllIntervals(): void {
    this.simulationIntervals.forEach((interval) => clearInterval(interval));
    this.simulationIntervals.clear();
  }

  private async removeSimulationTrackers(): Promise<void> {
    const trackers = await this.trackerService.getAllTrackers();
    const simulationTrackers = trackers.filter((t) =>
      t.socketClientId.startsWith('simulation-client'),
    );

    for (const tracker of simulationTrackers) {
      try {
        await this.trackerService.removeTracker(tracker.id);
        this.trackerGateway.server
          .to(trackingRooms.SUBSCRIBED)
          .emit(TrackingEvents.TRACKER_REMOVED, tracker);
      } catch (error) {
        console.warn(
          `Failed to remove simulation tracker ${tracker.id}:`,
          error.message,
        );
      }
    }
  }
}
