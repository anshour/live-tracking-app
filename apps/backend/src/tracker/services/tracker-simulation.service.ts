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
  onModuleDestroy() {
    this.stopSimulation();
  }

  startSimulation(): void {
    if (this.simulationActive) {
      return;
    }

    this.simulationActive = true;
    this.createSimulationTrackers();
  }

  stopSimulation(): void {
    if (!this.simulationActive) {
      return;
    }

    this.simulationActive = false;
    this.clearAllIntervals();
    this.removeSimulationTrackers();
  }

  isSimulationActive(): boolean {
    return this.simulationActive;
  }

  private createSimulationTrackers(): void {
    for (let i = 1; i <= this.SIMULATION_COUNT; i++) {
      const tracker = this.trackerService.addTracker({
        name: `Secret Agent ${i}`,
        socketClientId: `simulation-client-${i}`,
        coordinate: this.generateRandomCoordinate(),
      });

      this.trackerGateway.server
        .to(trackingRooms.SUBSCRIBED)
        .emit(TrackingEvents.TRACKER_REGISTERED, tracker);

      this.startLocationUpdateSimulation(tracker.id);
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

  private startLocationUpdateSimulation(trackerId: string): void {
    const updateLocation = () => {
      if (!this.simulationActive) return;

      try {
        const tracker = this.trackerService
          .getAllTrackers()
          .find((t) => t.id === trackerId);
        if (!tracker || !tracker.isOnline) return;

        const newCoordinate = this.generateRandomCoordinate();
        const updatedTracker = this.trackerService.updateLocation(
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
          updateLocation();
        }, nextUpdateDelay);
        this.simulationIntervals.set(`location-${trackerId}`, timeoutId);
      }
    };

    updateLocation();
  }

  private startOnlineStatusSimulation(trackerId: string): void {
    const toggleStatus = () => {
      if (!this.simulationActive) return;
      try {
        const tracker = this.trackerService
          .getAllTrackers()
          .find((t) => t.id === trackerId);
        if (!tracker) return;

        if (tracker.isOnline) {
          const stoppedTracker = this.trackerService.stopTracker(trackerId);
          this.trackerGateway.server
            .to(trackingRooms.SUBSCRIBED)
            .emit(TrackingEvents.TRACKER_STOPPED, stoppedTracker);
        } else {
          const updatedTracker = this.trackerService.updateLocation(
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
        const nextStatusDelay = Math.random() * 30000 + 45000; // 45-75 seconds
        const timeoutId = setTimeout(() => {
          toggleStatus();
        }, nextStatusDelay);
        this.simulationIntervals.set(`status-${trackerId}`, timeoutId);
      }
    };

    const initialDelay = Math.random() * 60000 + 30000; // 30-90 seconds
    const timeoutId = setTimeout(() => {
      toggleStatus();
    }, initialDelay);
    this.simulationIntervals.set(`status-${trackerId}`, timeoutId);
  }

  private clearAllIntervals(): void {
    this.simulationIntervals.forEach((interval) => clearInterval(interval));
    this.simulationIntervals.clear();
  }

  private removeSimulationTrackers(): void {
    const trackers = this.trackerService.getAllTrackers();
    const simulationTrackers = trackers.filter((t) =>
      t.socketClientId.startsWith('simulation-client'),
    );

    simulationTrackers.forEach((tracker) => {
      try {
        this.trackerService.removeTracker(tracker.id);
        this.trackerGateway.server
          .to(trackingRooms.SUBSCRIBED)
          .emit(TrackingEvents.TRACKER_REMOVED, tracker);
      } catch (error) {
        console.warn(
          `Failed to remove simulation tracker ${tracker.id}:`,
          error.message,
        );
      }
    });
  }
}
