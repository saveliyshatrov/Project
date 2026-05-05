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

    it('returns mobile device for mobile user agent', async () => {
        const res = await request(app)
            .get('/health')
            .set(
                'User-Agent',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            );
        expect(res.status).toBe(200);
        expect(res.body.device).toBe('mobile');
    });
});
