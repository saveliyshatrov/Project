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

describe('POST /resolver/batch', () => {
    it('returns 400 when batch is not an array', async () => {
        const res = await request(app).post('/resolver/batch').send({ batch: 'invalid' });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('array');
    });

    it('returns 404 for unknown resolver in batch', async () => {
        const res = await request(app)
            .post('/resolver/batch')
            .send({
                batch: [{ resolver: 'unknown' }],
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].error).toContain('not found');
    });

    it('executes batch of resolvers in order', async () => {
        const res = await request(app)
            .post('/resolver/batch')
            .send({
                batch: [
                    { resolver: 'resolveUsers', params: {} },
                    { resolver: 'resolveUsers', params: {} },
                ],
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('users');
        expect(res.body[1]).toHaveProperty('users');
    });

    it('handles mixed valid and invalid resolvers in batch', async () => {
        const res = await request(app)
            .post('/resolver/batch')
            .send({
                batch: [{ resolver: 'resolveUsers', params: {} }, { resolver: 'unknownResolver' }],
            });
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('users');
        expect(res.body[1]).toHaveProperty('error');
    });
});
