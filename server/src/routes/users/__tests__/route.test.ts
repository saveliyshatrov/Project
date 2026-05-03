import request from 'supertest';

import app from '../../../index';

describe('GET /users', () => {
    it('returns list of users', async () => {
        const res = await request(app).get('/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('users have required fields', async () => {
        const res = await request(app).get('/users');
        res.body.forEach((user: { id: string; name: string; email: string }) => {
            expect(user).toHaveProperty('id');
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('email');
        });
    });
});

describe('GET /users/:id', () => {
    it('returns user by id', async () => {
        const res = await request(app).get('/users/1');
        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('id', '1');
    });

    it('returns 404 for non-existent user', async () => {
        const res = await request(app).get('/users/nonexistent');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('User not found');
    });
});

describe('POST /users', () => {
    it('creates a new user', async () => {
        const res = await request(app).post('/users').send({
            name: 'New User',
            email: 'new@example.com',
        });
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toContain('New User');
    });
});
