import request from 'supertest';

import app from '../../../index';

describe('GET /resolver', () => {
    it('returns 400 when resolver name is missing', async () => {
        const res = await request(app).get('/resolver');
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Missing resolver name');
    });

    it('returns 404 for unknown resolver', async () => {
        const res = await request(app).get('/resolver?resolver=unknown');
        expect(res.status).toBe(404);
        expect(res.body.error).toContain('not found');
    });

    it('returns 200 for valid resolver', async () => {
        const res = await request(app).get('/resolver?resolver=resolveUsers&params={}');
        expect(res.status).toBe(200);
    });
});
