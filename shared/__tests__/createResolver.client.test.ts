import { createResolver } from '../src/resolver/createResolver.client';

describe('createResolver (client)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('makes a POST fetch request with resolver name in query and params in body', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ users: { '1': { id: '1' } } }),
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'testResolver' });
        await resolver({ id: '1' });

        expect(global.fetch).toHaveBeenCalledWith('/resolver?resolver=testResolver', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ params: { id: '1' } }),
        });
    });

    it('returns parsed JSON response on success', async () => {
        const responseData = { users: { '1': { id: '1' }, '2': { id: '2' } } };
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => responseData,
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'getUsers' });
        const result = await resolver({});

        expect(result).toEqual(responseData);
    });

    it('throws error when response is not ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'missingResolver' });

        await expect(resolver({})).rejects.toThrow('Resolver "missingResolver" failed: Not Found');
    });

    it('sends params in request body and resolver name in query', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'paramResolver' });
        await resolver({ limit: 10, offset: 5 });

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(fetchCall[0]).toBe('/resolver?resolver=paramResolver');
        expect(fetchCall[1]).toMatchObject({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        expect(JSON.parse(fetchCall[1].body)).toEqual({
            params: { limit: 10, offset: 5 },
        });
    });

    it('handles sync option in options', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ data: 'test' }),
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'syncResolver', sync: true });
        const result = await resolver({});

        expect(result).toEqual({ data: 'test' });
    });
});
