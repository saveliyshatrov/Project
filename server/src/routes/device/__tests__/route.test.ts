import request from 'supertest';

import app from '../../../index';

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
