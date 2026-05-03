import request from 'supertest';

import app, { server } from '../src/index';

afterAll((done) => {
    server.close(done);
});

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

describe('GET /device', () => {
    it('returns device type for mobile user agent', async () => {
        const res = await request(app)
            .get('/device')
            .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
        expect(res.status).toBe(200);
        expect(res.body.type).toBe('mobile');
        expect(res.body.isMobile).toBe(true);
    });

    it('returns device type for desktop user agent', async () => {
        const res = await request(app)
            .get('/device')
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
        expect(res.status).toBe(200);
        expect(res.body.type).toBe('desktop');
        expect(res.body.isDesktop).toBe(true);
    });
});

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
