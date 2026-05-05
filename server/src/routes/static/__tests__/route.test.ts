import request from 'supertest';

import app from '../../../index';

describe('Static route catch-all', () => {
    it('returns 404 when dist files do not exist', async () => {
        const res = await request(app).get('/non-existent-route');
        expect(res.status).toBe(404);
    });
});
