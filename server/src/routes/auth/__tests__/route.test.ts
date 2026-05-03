import request from 'supertest';

import app from '../../../index';

describe('POST /auth/register', () => {
    it('registers a new user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                name: 'Test User',
                email: `test-${Date.now()}@example.com`,
                password: 'password123',
            });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('name', 'Test User');
    });

    it('returns 400 for missing fields', async () => {
        const res = await request(app).post('/auth/register').send({
            name: 'Test User',
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('returns 400 for short password', async () => {
        const res = await request(app).post('/auth/register').send({
            name: 'Test User',
            email: 'short@example.com',
            password: '123',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('6 characters');
    });

    it('returns 409 for duplicate email', async () => {
        const email = `dup-${Date.now()}@example.com`;
        await request(app).post('/auth/register').send({
            name: 'First',
            email,
            password: 'password123',
        });

        const res = await request(app).post('/auth/register').send({
            name: 'Second',
            email,
            password: 'password123',
        });
        expect(res.status).toBe(409);
        expect(res.body.error).toContain('already exists');
    });
});
