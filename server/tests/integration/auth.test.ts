import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/database.js';

describe('Authentication & Authorization Flow', () => {
  const app = createApp();

  const testUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@example.com',
    password: 'Password123!',
  };

  beforeEach(async () => {
    // Clean up test user if present
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  it('POST /api/auth/register creates a customer account and sets auth cookie', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toHaveProperty('id');
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.user.role).toBe('CUSTOMER');
    expect(response.body.data.user).not.toHaveProperty('passwordHash');

    // Check Set-Cookie header
    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
  });

  it('POST /api/auth/register fails when email already exists', async () => {
    // First registration
    await request(app).post('/api/auth/register').send(testUser);

    // Duplicate registration attempt
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/auth/register fails with invalid password or email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'J',
        lastName: 'D',
        email: 'not-an-email',
        password: 'weak',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.length).toBeGreaterThan(0);
  });

  it('POST /api/auth/login authenticates with valid credentials', async () => {
    // Create user first
    await request(app).post('/api/auth/register').send(testUser);

    // Login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data).toHaveProperty('token');
  });

  it('POST /api/auth/login rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me returns current user info with cookie or Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@store.com',
        password: 'CustomerPass123!',
      });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('customer@store.com');
  });

  it('GET /api/auth/me rejects unauthenticated requests', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
