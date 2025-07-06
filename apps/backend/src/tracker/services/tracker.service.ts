import {
  Tracker,
  TrackerHistory,
  Coordinate,
  calculateDistance,
} from '@livetracking/shared';
import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';

@Injectable()
export class TrackerService {
  private trackers: Tracker[] = [];
  private history: TrackerHistory[] = [];

  private readonly DISTANCE_THRESHOLD = 2000; // 2 km in meters
  private readonly MAX_HISTORY_ENTRIES = 20;

  private addHistory(trackerId: string, coordinate: Coordinate): void {
    const currentHistory = this.history.filter(
      (item) => item.trackerId === trackerId,
    );

    if (currentHistory.length >= this.MAX_HISTORY_ENTRIES) {
      const lastHistory = currentHistory.pop();

      this.history = this.history.filter((item) => item.id !== lastHistory!.id);
    }

    const historyEntry: TrackerHistory = {
      id: uuidv7(),
      trackerId: trackerId,
      coordinate: coordinate,
      timestamp: new Date().toISOString(),
    };

    this.history.unshift(historyEntry);
  }

  findTrackerBySocketClient(clientId: string): Tracker | null {
    const tracker = this.trackers.find((t) => t.socketClientId === clientId);

    return tracker || null;
  }

  addTracker(tracker: Omit<Tracker, 'id' | 'isOnline' | 'lastSeen'>): Tracker {
    const existingTracker = this.findTrackerBySocketClient(
      tracker.socketClientId,
    );

    if (existingTracker) {
      return existingTracker;
    }

    const newTracker = {
      ...tracker,
      id: uuidv7(),
      isOnline: true,
      lastSeen: new Date().toISOString(),
    };
    this.trackers.push(newTracker);
    return newTracker;
  }

  removeTracker(id: string): boolean {
    const index = this.trackers.findIndex((tracker) => tracker.id === id);
    if (index !== -1) {
      this.trackers.splice(index, 1);
      return true;
    }

    throw new Error(`Tracker with id ${id} not found`);
  }

  updateLocation(trackerId: string, coordinate: Coordinate): Tracker {
    const index = this.trackers.findIndex(
      (tracker) => tracker.id === trackerId,
    );
    if (index !== -1) {
      const tracker = this.trackers[index];
      if (tracker.coordinate) {
        const distance = calculateDistance(tracker.coordinate, coordinate);
        if (distance > this.DISTANCE_THRESHOLD) {
          this.addHistory(trackerId, coordinate);
        }
      }

      this.trackers[index].isOnline = true;
      this.trackers[index].coordinate = coordinate;
      this.trackers[index].lastSeen = new Date().toISOString();

      return this.trackers[index];
    }

    throw new Error(`Tracker with id ${trackerId} not found`);
  }

  stopTracker(trackerId: string): Tracker {
    const index = this.trackers.findIndex(
      (tracker) => tracker.id === trackerId,
    );
    if (index !== -1) {
      this.trackers[index].isOnline = false;
      this.trackers[index].coordinate = null;

      return this.trackers[index];
    }

    throw new Error(`Tracker with id ${trackerId} not found`);
  }

  getAllTrackers(): Tracker[] {
    return this.trackers;
  }

  getTrackerHistory(id: string): TrackerHistory[] {
    return this.history.filter((item) => item.trackerId === id);
  }
}
