import request from 'supertest';

import app from '../../../index';

describe('Static route catch-all', () => {
    it('returns 200 when SSR catch-all handles unknown routes', async () => {
        const res = await request(app).get('/non-existent-route');
        expect(res.status).toBe(200);
    });
});
