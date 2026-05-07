import { createResolver } from '../src/resolver/createResolver.client';

describe('createResolver (client)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
        jest.useFakeTimers();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.useRealTimers();
    });

    it('sends batched request to /resolver/batch', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [{ users: { '1': { id: '1' } } }],
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'testResolver' });
        const promise = resolver({ id: '1' });

        jest.runAllTimers();
        await Promise.resolve();

        await promise;

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/resolver/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                batch: [{ resolver: 'testResolver', params: { id: '1' } }],
            }),
        });
    });

    it('returns parsed JSON response on success', async () => {
        const responseData = { users: { '1': { id: '1' }, '2': { id: '2' } } };
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [responseData],
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'getUsers' });
        const promise = resolver({});

        jest.runAllTimers();
        await Promise.resolve();

        const result = await promise;

        expect(result).toEqual(responseData);
    });

    it('throws error when response is not ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            text: async () => 'Not Found',
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'missingResolver' });
        const promise = resolver({});

        jest.runAllTimers();
        await Promise.resolve();

        await expect(promise).rejects.toThrow('Not Found');
    });

    it('sends params in batch entry', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [{}],
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'paramResolver' });
        const promise = resolver({ limit: 10, offset: 5 });

        jest.runAllTimers();
        await Promise.resolve();

        await promise;

        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        expect(fetchCall[0]).toBe('/resolver/batch');
        expect(JSON.parse(fetchCall[1].body)).toEqual({
            batch: [{ resolver: 'paramResolver', params: { limit: 10, offset: 5 } }],
        });
    });

    it('handles sync option in options', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [{ data: 'test' }],
        });

        const resolver = createResolver<any, any>(() => ({}), { name: 'syncResolver', sync: true });
        const promise = resolver({});

        jest.runAllTimers();
        await Promise.resolve();

        const result = await promise;

        expect(result).toEqual({ data: 'test' });
    });
});
