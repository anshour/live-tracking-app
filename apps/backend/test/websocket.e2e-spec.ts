import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { io, Socket } from 'socket.io-client';
import { TrackingEvents } from '@livetracking/shared';
import * as request from 'supertest';

describe('WebSocket Gateway (e2e)', () => {
  let app: INestApplication;
  let client: Socket;
  let authToken: string;
  let serverPort: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();
    await app.listen(0); // Use random port

    const server = app.getHttpServer();
    const address = server.address();
    serverPort = typeof address === 'string' ? 3001 : address?.port || 3001;

    // Get auth token for authenticated socket connections
    const loginResponse = await request(server).post('/api/auth/login').send({
      email: 'demo@example.com',
      password: 'password',
    });

    authToken = loginResponse.body.token;

    // Create socket client
    client = io(`http://localhost:${serverPort}/socket`, {
      auth: {
        token: authToken,
      },
      transports: ['websocket'],
      forceNew: true,
    });
  });

  afterAll(async () => {
    if (client) {
      client.disconnect();
    }
    await app.close();
  });

  describe('Tracker Subscription', () => {
    it('should subscribe to tracking room', (done) => {
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, (response: any) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Subscribed to tracking room');
        done();
      });
    });

    it('should unsubscribe from tracking room', (done) => {
      client.emit(TrackingEvents.TRACKER_UNSUBSCRIBE, {}, (response: any) => {
        expect(response.status).toBe('success');
        expect(response.message).toBe('Unsubscribed from tracking room');
        done();
      });
    });
  });

  describe('Tracker Registration', () => {
    beforeEach((done) => {
      // Subscribe to tracking room before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        done();
      });
    });

    afterEach(() => {
      // Clean up listeners after each test
      client.removeAllListeners(TrackingEvents.TRACKER_REGISTERED);
      client.removeAllListeners('exception');
    });

    it('should register tracker successfully', (done) => {
      const trackerData = {
        lat: -6.2088,
        lng: 106.8456,
      };

      client.on(TrackingEvents.TRACKER_REGISTERED, (tracker: any) => {
        expect(tracker).toHaveProperty('id');
        expect(tracker).toHaveProperty('name');
        expect(tracker).toHaveProperty('socketClientId');
        expect(tracker).toHaveProperty('isOnline', true);
        expect(tracker).toHaveProperty('coordinate');
        expect(tracker.coordinate.lat).toBeCloseTo(trackerData.lat, 4);
        expect(tracker.coordinate.lng).toBeCloseTo(trackerData.lng, 4);
        done();
      });

      client.emit(TrackingEvents.TRACKER_REGISTER, trackerData);
    });

    it('should fail to register tracker with invalid coordinates', (done) => {
      const invalidData = {
        lat: 'invalid',
        lng: 'invalid',
      };

      client.on('exception', (error: any) => {
        expect(error).toBeDefined();
        expect(error.message).toContain('Expected number, received string');
        done();
      });

      client.emit(TrackingEvents.TRACKER_REGISTER, invalidData);
    });

    it('should fail to register tracker with missing coordinates', (done) => {
      const incompleteData = {
        lat: -6.2088,
        // missing lng
      };

      client.on('exception', (error: any) => {
        expect(error).toBeDefined();
        expect(error.message).toContain('Required');
        done();
      });

      client.emit(TrackingEvents.TRACKER_REGISTER, incompleteData);
    });
  });

  describe('Tracker Location Updates', () => {
    let trackerId: string;

    beforeEach((done) => {
      // Clean up any existing listeners to avoid conflicts
      client.removeAllListeners(TrackingEvents.TRACKER_REGISTERED);

      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        const registrationHandler = (tracker: any) => {
          trackerId = tracker.id;
          client.removeListener(
            TrackingEvents.TRACKER_REGISTERED,
            registrationHandler,
          );
          done();
        };

        client.on(TrackingEvents.TRACKER_REGISTERED, registrationHandler);

        client.emit(TrackingEvents.TRACKER_REGISTER, {
          lat: -6.2088,
          lng: 106.8456,
        });
      });
    });

    afterEach(() => {
      // Clean up listeners after each test
      client.removeAllListeners(TrackingEvents.TRACKER_UPDATED);
      client.removeAllListeners('exception');
    });

    it('should update tracker location successfully', (done) => {
      const newLocation = {
        lat: -6.21,
        lng: 106.85,
      };

      client.on(TrackingEvents.TRACKER_UPDATED, (tracker: any) => {
        expect(tracker.id).toBe(trackerId);
        expect(tracker.coordinate.lat).toBeCloseTo(newLocation.lat, 4);
        expect(tracker.coordinate.lng).toBeCloseTo(newLocation.lng, 4);
        expect(tracker.isOnline).toBe(true);
        done();
      });

      client.emit(TrackingEvents.TRACKER_UPDATE, newLocation);
    });

    it('should fail to update location with invalid coordinates', (done) => {
      const invalidLocation = {
        lat: 'invalid',
        lng: 'invalid',
      };

      client.on('exception', (error: any) => {
        expect(error).toBeDefined();
        done();
      });

      client.emit(TrackingEvents.TRACKER_UPDATE, invalidLocation);
    });

    it('should fail to update location without registration', (done) => {
      const newClient = io(`http://localhost:${serverPort}/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      newClient.on('connect', () => {
        newClient.on('exception', (error: any) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('not found');
          newClient.disconnect();
          done();
        });

        newClient.emit(TrackingEvents.TRACKER_UPDATE, {
          lat: -6.21,
          lng: 106.85,
        });
      });
    });
  });

  describe('Tracker Stop', () => {
    let trackerId: string;

    beforeEach((done) => {
      // Clean up any existing listeners to avoid conflicts
      client.removeAllListeners(TrackingEvents.TRACKER_REGISTERED);

      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        const registrationHandler = (tracker: any) => {
          trackerId = tracker.id;
          client.removeListener(
            TrackingEvents.TRACKER_REGISTERED,
            registrationHandler,
          );
          done();
        };

        client.on(TrackingEvents.TRACKER_REGISTERED, registrationHandler);

        client.emit(TrackingEvents.TRACKER_REGISTER, {
          lat: -6.2088,
          lng: 106.8456,
        });
      });
    });

    it('should stop tracker successfully', (done) => {
      client.on(TrackingEvents.TRACKER_STOPPED, (tracker: any) => {
        expect(tracker.id).toBe(trackerId);
        expect(tracker.isOnline).toBe(false);
        expect(tracker.coordinate).toBeNull();
        done();
      });

      client.emit(TrackingEvents.TRACKER_STOP);
    });

    it('should fail to stop non-existent tracker', (done) => {
      const newClient = io(`http://localhost:${serverPort}/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      newClient.on('connect', () => {
        newClient.on('exception', (error: any) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('not found');
          newClient.disconnect();
          done();
        });

        newClient.emit(TrackingEvents.TRACKER_STOP);
      });
    });
  });

  describe('Tracker Removal', () => {
    let trackerId: string;

    beforeEach((done) => {
      // Clean up any existing listeners to avoid conflicts
      client.removeAllListeners(TrackingEvents.TRACKER_REGISTERED);

      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        const registrationHandler = (tracker: any) => {
          trackerId = tracker.id;
          client.removeListener(
            TrackingEvents.TRACKER_REGISTERED,
            registrationHandler,
          );
          done();
        };

        client.on(TrackingEvents.TRACKER_REGISTERED, registrationHandler);

        client.emit(TrackingEvents.TRACKER_REGISTER, {
          lat: -6.2088,
          lng: 106.8456,
        });
      });
    });

    it('should remove tracker successfully', (done) => {
      client.on(TrackingEvents.TRACKER_REMOVED, (tracker: any) => {
        expect(tracker.id).toBe(trackerId);
        done();
      });

      client.emit(TrackingEvents.TRACKER_REMOVE);
    });

    it('should fail to remove non-existent tracker', (done) => {
      const newClient = io(`http://localhost:${serverPort}/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      newClient.on('connect', () => {
        newClient.on('exception', (error: any) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('not found');
          newClient.disconnect();
          done();
        });

        newClient.emit(TrackingEvents.TRACKER_REMOVE);
      });
    });
  });

  describe('Disconnect Handling', () => {
    it('should handle client disconnection gracefully', (done) => {
      const testClient = io(`http://localhost:${serverPort}/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      testClient.on('connect', () => {
        // Register tracker
        testClient.emit(TrackingEvents.TRACKER_REGISTER, {
          lat: -6.2088,
          lng: 106.8456,
        });

        // Disconnect immediately
        setTimeout(() => {
          testClient.disconnect();
          done();
        }, 100);
      });
    });
  });
});
