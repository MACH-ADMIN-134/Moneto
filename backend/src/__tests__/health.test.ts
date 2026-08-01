import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Observability Endpoints (/api/v1)', () => {
  it('GET /api/v1/health should return 200 and healthy envelope', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.meta).toHaveProperty('timestamp');
    expect(res.headers).toHaveProperty('x-request-id');
  });

  it('GET /api/v1/live should return 200 and alive status', async () => {
    const res = await request(app).get('/api/v1/live');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('alive');
  });

  it('GET /api/v1/nonexistent should return 404 envelope', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('NotFound');
  });
});
