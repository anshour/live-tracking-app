import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TrackerService } from '../src/tracker/services/tracker.service';
import { Tracker, Coordinate } from '@livetracking/shared';

describe('Tracker Service Integration (e2e)', () => {
  let app: INestApplication;
  let trackerService: TrackerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();

    trackerService = moduleFixture.get<TrackerService>(TrackerService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Clean up trackers before each test
    const trackers = trackerService.getAllTrackers();
    trackers.forEach((tracker) => {
      try {
        trackerService.removeTracker(tracker.id);
      } catch {
        // Ignore errors during cleanup
      }
    });
  });

  describe('Tracker CRUD Operations', () => {
    it('should add a new tracker', () => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker = trackerService.addTracker(trackerData);

      expect(tracker).toHaveProperty('id');
      expect(tracker).toHaveProperty('name', trackerData.name);
      expect(tracker).toHaveProperty(
        'socketClientId',
        trackerData.socketClientId,
      );
      expect(tracker).toHaveProperty('isOnline', true);
      expect(tracker).toHaveProperty('lastSeen');
      expect(tracker.coordinate).toEqual(trackerData.coordinate);
    });

    it('should not add duplicate tracker with same socket client id', () => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker1 = trackerService.addTracker(trackerData);
      const tracker2 = trackerService.addTracker(trackerData);

      expect(tracker1.id).toBe(tracker2.id);
      expect(trackerService.getAllTrackers().length).toBe(1);
    });

    it('should find tracker by socket client id', () => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker = trackerService.addTracker(trackerData);
      const foundTracker =
        trackerService.findTrackerBySocketClient('test-client-123');

      expect(foundTracker).toBeDefined();
      expect(foundTracker?.id).toBe(tracker.id);
    });

    it('should return null for non-existent socket client id', () => {
      const foundTracker = trackerService.findTrackerBySocketClient(
        'non-existent-client',
      );

      expect(foundTracker).toBeNull();
    });

    it('should remove tracker successfully', () => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker = trackerService.addTracker(trackerData);
      const result = trackerService.removeTracker(tracker.id);

      expect(result).toBe(true);
      expect(trackerService.getAllTrackers().length).toBe(0);
    });

    it('should throw error when removing non-existent tracker', () => {
      expect(() => {
        trackerService.removeTracker('non-existent-id');
      }).toThrow('Tracker with id non-existent-id not found');
    });
  });

  describe('Location Updates', () => {
    let tracker: Tracker;

    beforeEach(() => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      tracker = trackerService.addTracker(trackerData);
    });

    it('should update tracker location successfully', () => {
      const newLocation: Coordinate = { lat: -6.21, lng: 106.85 };
      const updatedTracker = trackerService.updateLocation(
        tracker.id,
        newLocation,
      );

      expect(updatedTracker.coordinate).toEqual(newLocation);
      expect(updatedTracker.isOnline).toBe(true);
      expect(updatedTracker.lastSeen).toBeDefined();
    });

    it('should throw error when updating non-existent tracker', () => {
      const newLocation: Coordinate = { lat: -6.21, lng: 106.85 };

      expect(() => {
        trackerService.updateLocation('non-existent-id', newLocation);
      }).toThrow('Tracker with id non-existent-id not found');
    });

    it('should add history entry for significant location changes', () => {
      const significantlyDifferentLocation: Coordinate = {
        lat: -6.4088,
        lng: 106.6456,
      }; // About 22km away

      trackerService.updateLocation(tracker.id, significantlyDifferentLocation);

      const history = trackerService.getTrackerHistory(tracker.id);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should not add history entry for small location changes', () => {
      const slightlyDifferentLocation: Coordinate = {
        lat: -6.2089,
        lng: 106.8457,
      }; // Very close location

      trackerService.updateLocation(tracker.id, slightlyDifferentLocation);

      const history = trackerService.getTrackerHistory(tracker.id);
      expect(history.length).toBe(0);
    });
  });

  describe('Tracker Status Management', () => {
    let tracker: Tracker;

    beforeEach(() => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      tracker = trackerService.addTracker(trackerData);
    });

    it('should stop tracker successfully', () => {
      const stoppedTracker = trackerService.stopTracker(tracker.id);

      expect(stoppedTracker.isOnline).toBe(false);
      expect(stoppedTracker.coordinate).toBeNull();
    });

    it('should throw error when stopping non-existent tracker', () => {
      expect(() => {
        trackerService.stopTracker('non-existent-id');
      }).toThrow('Tracker with id non-existent-id not found');
    });
  });

  describe('History Management', () => {
    let tracker: Tracker;

    beforeEach(() => {
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      tracker = trackerService.addTracker(trackerData);
    });

    it('should return empty history for new tracker', () => {
      const history = trackerService.getTrackerHistory(tracker.id);
      expect(history).toEqual([]);
    });

    it('should return empty history for non-existent tracker', () => {
      const history = trackerService.getTrackerHistory('non-existent-id');
      expect(history).toEqual([]);
    });

    it('should limit history entries to maximum allowed', () => {
      // Add many significant location changes
      for (let i = 0; i < 25; i++) {
        const newLocation: Coordinate = {
          lat: -6.2088 + i * 0.1, // Each location is significantly different
          lng: 106.8456 + i * 0.1,
        };
        trackerService.updateLocation(tracker.id, newLocation);
      }

      const history = trackerService.getTrackerHistory(tracker.id);
      expect(history.length).toBeLessThanOrEqual(20); // MAX_HISTORY_ENTRIES
    });

    it('should order history entries with most recent first', () => {
      // Add multiple significant location changes
      const locations = [
        { lat: -6.2088, lng: 106.8456 },
        { lat: -6.4088, lng: 106.6456 },
        { lat: -6.6088, lng: 106.4456 },
      ];

      for (const location of locations) {
        trackerService.updateLocation(tracker.id, location);
      }

      const history = trackerService.getTrackerHistory(tracker.id);
      expect(history.length).toBeGreaterThan(0);

      // Check that timestamps are in descending order (most recent first)
      for (let i = 0; i < history.length - 1; i++) {
        const currentTime = new Date(history[i].timestamp).getTime();
        const nextTime = new Date(history[i + 1].timestamp).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    });
  });

  describe('Integration with REST API', () => {
    it('should integrate tracker service with REST endpoints', async () => {
      // Add tracker through service
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker = trackerService.addTracker(trackerData);

      // Get all trackers through REST API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get('/api/trackers')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(tracker.id);
      expect(response.body[0].name).toBe(trackerData.name);
    });

    it('should get tracker history through REST API', async () => {
      // Add tracker and create history
      const trackerData = {
        name: 'Test Tracker',
        socketClientId: 'test-client-123',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker = trackerService.addTracker(trackerData);

      // Add significant location change to create history
      const significantlyDifferentLocation: Coordinate = {
        lat: -6.4088,
        lng: 106.6456,
      };
      trackerService.updateLocation(tracker.id, significantlyDifferentLocation);

      // Get history through REST API
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = await request(app.getHttpServer())
        .get(`/api/trackers/${tracker.id}/histories`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('trackerId', tracker.id);
      expect(response.body[0]).toHaveProperty('coordinate');
      expect(response.body[0]).toHaveProperty('timestamp');
    });
  });

  describe('Multiple Trackers', () => {
    it('should handle multiple trackers independently', () => {
      const tracker1Data = {
        name: 'Tracker 1',
        socketClientId: 'client-1',
        coordinate: { lat: -6.2088, lng: 106.8456 } as Coordinate,
      };

      const tracker2Data = {
        name: 'Tracker 2',
        socketClientId: 'client-2',
        coordinate: { lat: -6.3088, lng: 106.9456 } as Coordinate,
      };

      const tracker1 = trackerService.addTracker(tracker1Data);
      const tracker2 = trackerService.addTracker(tracker2Data);

      expect(tracker1.id).not.toBe(tracker2.id);
      expect(trackerService.getAllTrackers().length).toBe(2);

      // Update tracker1 location
      const newLocation1: Coordinate = { lat: -6.21, lng: 106.85 };
      trackerService.updateLocation(tracker1.id, newLocation1);

      // Stop tracker2
      trackerService.stopTracker(tracker2.id);

      const allTrackers = trackerService.getAllTrackers();
      const updatedTracker1 = allTrackers.find((t) => t.id === tracker1.id);
      const stoppedTracker2 = allTrackers.find((t) => t.id === tracker2.id);

      expect(updatedTracker1?.coordinate).toEqual(newLocation1);
      expect(updatedTracker1?.isOnline).toBe(true);
      expect(stoppedTracker2?.isOnline).toBe(false);
      expect(stoppedTracker2?.coordinate).toBeNull();
    });
  });
});
