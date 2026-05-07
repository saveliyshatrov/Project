import request from 'supertest';

import app from '../../../index';

describe('POST /resolver', () => {
    it('returns 400 when resolver name is missing', async () => {
        const res = await request(app).post('/resolver').send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('resolver');
    });

    it('returns 404 for unknown resolver', async () => {
        const res = await request(app).post('/resolver?resolver=unknown').send({});
        expect(res.status).toBe(404);
        expect(res.body.error).toContain('not found');
    });

    it('returns 200 for valid resolver', async () => {
        const res = await request(app).post('/resolver?resolver=resolveUsers').send({ params: {} });
        expect(res.status).toBe(200);
    });
});
