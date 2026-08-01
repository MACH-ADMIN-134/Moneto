import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Categories API Endpoint', () => {
  it('GET /api/v1/categories should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Authorization');
  });

  it('GET /api/v1/feature-flags should return public feature flag state', async () => {
    const res = await request(app).get('/api/v1/feature-flags');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('enableAI');
    expect(res.body.data).toHaveProperty('enableUPI');
  });
});
