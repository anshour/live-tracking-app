import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Live Tracking App (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication (e2e)', () => {
    describe('POST /api/auth/login', () => {
      it('should login successfully with valid credentials', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'demo@example.com',
            password: 'password',
          })
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('email', 'demo@example.com');
        expect(response.body.user).toHaveProperty('name', 'Demo User');
        expect(response.body.user).not.toHaveProperty('password');

        // Store token for subsequent tests
        authToken = response.body.token;
      });

      it('should fail with invalid email', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'invalid@example.com',
            password: 'password',
          })
          .expect(401);

        expect(response.body).toHaveProperty(
          'message',
          'Invalid email or password',
        );
      });

      it('should fail with invalid password', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'demo@example.com',
            password: 'wrongpassword',
          })
          .expect(401);

        expect(response.body).toHaveProperty(
          'message',
          'Invalid email or password',
        );
      });

      it('should fail with missing email', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            password: 'password',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('email');
      });

      it('should fail with invalid email format', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'invalid-email',
            password: 'password',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('email');
      });

      it('should fail with missing password', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: 'demo@example.com',
          })
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('password');
      });
    });

    describe('GET /api/auth/profile', () => {
      it('should get user profile with valid token', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('email', 'demo@example.com');
        expect(response.body).toHaveProperty('name', 'Demo User');
        expect(response.body).not.toHaveProperty('password');
      });

      it('should fail without token', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/auth/profile')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should fail with invalid token', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Unauthorized');
      });

      it('should fail with malformed authorization header', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/auth/profile')
          .set('Authorization', 'InvalidFormat')
          .expect(401);

        expect(response.body).toHaveProperty('message', 'Unauthorized');
      });
    });
  });

  describe('Trackers (e2e)', () => {
    describe('GET /api/trackers', () => {
      it('should get all trackers (empty initially)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trackers')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });

    describe('GET /api/trackers/:id/histories', () => {
      it('should get tracker history (empty for non-existent tracker)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trackers/non-existent-id/histories')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(0);
      });
    });
  });

  describe('Tracker Simulation (e2e)', () => {
    describe('GET /api/trackers/simulation/status', () => {
      it('should get simulation status (inactive initially)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);

        expect(response.body).toHaveProperty('isActive', false);
      });
    });

    describe('POST /api/trackers/simulation/start', () => {
      it('should start tracker simulation', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/trackers/simulation/start')
          .expect(201);

        expect(response.body).toHaveProperty(
          'message',
          'Tracker simulation started',
        );
      });

      it('should show simulation as active after starting', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);

        expect(response.body).toHaveProperty('isActive', true);
      });
    });

    describe('POST /api/trackers/simulation/stop', () => {
      it('should stop tracker simulation', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/trackers/simulation/stop')
          .expect(201);

        expect(response.body).toHaveProperty(
          'message',
          'Tracker simulation stopped',
        );
      });

      it('should show simulation as inactive after stopping', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);

        expect(response.body).toHaveProperty('isActive', false);
      });
    });

    describe('Simulation lifecycle', () => {
      it('should handle multiple start/stop cycles', async () => {
        // Start simulation
        await request(app.getHttpServer())
          .post('/api/trackers/simulation/start')
          .expect(201);

        let statusResponse = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);
        expect(statusResponse.body.isActive).toBe(true);

        // Stop simulation
        await request(app.getHttpServer())
          .post('/api/trackers/simulation/stop')
          .expect(201);

        statusResponse = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);
        expect(statusResponse.body.isActive).toBe(false);

        // Start again
        await request(app.getHttpServer())
          .post('/api/trackers/simulation/start')
          .expect(201);

        statusResponse = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);
        expect(statusResponse.body.isActive).toBe(true);

        // Stop again
        await request(app.getHttpServer())
          .post('/api/trackers/simulation/stop')
          .expect(201);

        statusResponse = await request(app.getHttpServer())
          .get('/api/trackers/simulation/status')
          .expect(200);
        expect(statusResponse.body.isActive).toBe(false);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle authentication flow and access protected resources', async () => {
      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'demo@example.com',
          password: 'password',
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Access protected profile
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.email).toBe('demo@example.com');

      // Access public endpoints
      await request(app.getHttpServer()).get('/api/trackers').expect(200);

      await request(app.getHttpServer())
        .get('/api/trackers/simulation/status')
        .expect(200);
    });

    it('should handle invalid routes gracefully', async () => {
      await request(app.getHttpServer())
        .get('/api/non-existent-endpoint')
        .expect(404);

      await request(app.getHttpServer())
        .post('/api/auth/non-existent-action')
        .expect(404);

      await request(app.getHttpServer())
        .get('/api/trackers/simulation/non-existent-action')
        .expect(404);
    });

    it('should handle CORS properly', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .expect(204);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
