import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

describe('API Foundation & Health Check', () => {
  const app = createApp();

  it('GET /api/health returns 200 with standard success envelope', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('status', 'UP');
    expect(response.body.data).toHaveProperty('uptime');
  });

  it('GET /api/unknown-endpoint returns 404 with standard error envelope', async () => {
    const response = await request(app).get('/api/unknown-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'ROUTE_NOT_FOUND');
  });
});
