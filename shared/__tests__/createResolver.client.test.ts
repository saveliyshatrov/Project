import { createResolver } from '../src/resolver/createResolver.client';

describe('createResolver (client)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('makes a fetch request with resolver name and params', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({ users: { '1': { id: '1' } } }),
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'testResolver' });
        await resolver({ id: '1' });

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/resolver?resolver=testResolver'));
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining(encodeURIComponent(JSON.stringify({ id: '1' })))
        );
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

    it('includes params in query string', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'paramResolver' });
        await resolver({ limit: 10, offset: 5 });

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0][0];
        const url = new URL(fetchCall, 'http://localhost');
        expect(url.searchParams.get('resolver')).toBe('paramResolver');
        expect(JSON.parse(url.searchParams.get('params')!)).toEqual({ limit: 10, offset: 5 });
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
