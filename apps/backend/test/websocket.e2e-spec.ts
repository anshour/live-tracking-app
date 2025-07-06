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
    const port = typeof address === 'string' ? 3001 : address?.port || 3001;

    // Get auth token for authenticated socket connections
    const loginResponse = await request(server).post('/api/auth/login').send({
      email: 'demo@example.com',
      password: 'password',
    });

    authToken = loginResponse.body.token;

    // Create socket client
    client = io(`http://localhost:${port}/socket`, {
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

  describe('Connection', () => {
    it('should connect successfully with valid token', (done) => {
      client.on('connect', () => {
        expect(client.connected).toBe(true);
        done();
      });

      client.on('connect_error', (error) => {
        done(error);
      });
    });

    it('should reject connection with invalid token', (done) => {
      const invalidClient = io(`http://localhost:3001/socket`, {
        auth: {
          token: 'invalid-token',
        },
        transports: ['websocket'],
        forceNew: true,
      });

      invalidClient.on('connect_error', (error) => {
        expect(error).toBeDefined();
        invalidClient.disconnect();
        done();
      });

      invalidClient.on('connect', () => {
        invalidClient.disconnect();
        done(new Error('Should not connect with invalid token'));
      });
    });

    it('should reject connection without token', (done) => {
      const noAuthClient = io(`http://localhost:3001/socket`, {
        transports: ['websocket'],
        forceNew: true,
      });

      noAuthClient.on('connect_error', (error) => {
        expect(error).toBeDefined();
        noAuthClient.disconnect();
        done();
      });

      noAuthClient.on('connect', () => {
        noAuthClient.disconnect();
        done(new Error('Should not connect without token'));
      });
    });
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
        expect(tracker.coordinate.lat).toBe(trackerData.lat);
        expect(tracker.coordinate.lng).toBe(trackerData.lng);
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
        expect(error.message).toContain('validation');
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
        done();
      });

      client.emit(TrackingEvents.TRACKER_REGISTER, incompleteData);
    });
  });

  describe('Tracker Location Updates', () => {
    let trackerId: string;

    beforeEach((done) => {
      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        client.on(TrackingEvents.TRACKER_REGISTERED, (tracker: any) => {
          trackerId = tracker.id;
          done();
        });

        client.emit(TrackingEvents.TRACKER_REGISTER, {
          lat: -6.2088,
          lng: 106.8456,
        });
      });
    });

    it('should update tracker location successfully', (done) => {
      const newLocation = {
        lat: -6.21,
        lng: 106.85,
      };

      client.on(TrackingEvents.TRACKER_UPDATED, (tracker: any) => {
        expect(tracker.id).toBe(trackerId);
        expect(tracker.coordinate.lat).toBe(newLocation.lat);
        expect(tracker.coordinate.lng).toBe(newLocation.lng);
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
      const newClient = io(`http://localhost:3001/socket`, {
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
      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        client.on(TrackingEvents.TRACKER_REGISTERED, (tracker: any) => {
          trackerId = tracker.id;
          done();
        });

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
      const newClient = io(`http://localhost:3001/socket`, {
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
      // Subscribe and register tracker before each test
      client.emit(TrackingEvents.TRACKER_SUBSCRIBE, {}, () => {
        client.on(TrackingEvents.TRACKER_REGISTERED, (tracker: any) => {
          trackerId = tracker.id;
          done();
        });

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
      const newClient = io(`http://localhost:3001/socket`, {
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
      const testClient = io(`http://localhost:3001/socket`, {
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

  describe('Multiple Clients', () => {
    it('should handle multiple clients subscribing to the same room', (done) => {
      const client1 = io(`http://localhost:3001/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      const client2 = io(`http://localhost:3001/socket`, {
        auth: {
          token: authToken,
        },
        transports: ['websocket'],
        forceNew: true,
      });

      let connectedClients = 0;
      let receivedEvents = 0;

      const handleConnect = () => {
        connectedClients++;
        if (connectedClients === 2) {
          // Both clients connected, now subscribe them
          client1.emit(TrackingEvents.TRACKER_SUBSCRIBE);
          client2.emit(TrackingEvents.TRACKER_SUBSCRIBE);

          // Client 2 should receive the registration event from client 1
          client2.on(TrackingEvents.TRACKER_REGISTERED, (tracker: any) => {
            expect(tracker).toHaveProperty('id');
            receivedEvents++;
            if (receivedEvents === 1) {
              client1.disconnect();
              client2.disconnect();
              done();
            }
          });

          // Client 1 registers a tracker
          setTimeout(() => {
            client1.emit(TrackingEvents.TRACKER_REGISTER, {
              lat: -6.2088,
              lng: 106.8456,
            });
          }, 100);
        }
      };

      client1.on('connect', handleConnect);
      client2.on('connect', handleConnect);
    });
  });
});
