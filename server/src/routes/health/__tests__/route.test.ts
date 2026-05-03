import request from 'supertest';

import app from '../../../index';

describe('GET /health', () => {
    it('returns 200 with status OK', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body).toHaveProperty('version');
    });

    it('includes device and platform info', async () => {
        const res = await request(app).get('/health');
        expect(res.body).toHaveProperty('device');
        expect(res.body).toHaveProperty('platform');
    });
});
