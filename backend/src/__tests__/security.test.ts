import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Security Headers Baseline', () => {
  it('should inject security headers on API responses', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.headers['x-correlation-id']).toBeDefined();
  });
});
