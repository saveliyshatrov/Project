import { enqueueResolverCall } from '../src/resolver/resolverBatch.client';

describe('resolverBatch (client)', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = jest.fn();
        jest.useFakeTimers();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        jest.useRealTimers();
    });

    it('batches multiple resolver calls into one request', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [{ users: { '1': { id: '1' } } }, { users: { '2': { id: '2' } } }],
        });

        const result1 = enqueueResolverCall('resolveUsers', { limit: 10 });
        const result2 = enqueueResolverCall('resolveUsers', { limit: 20 });

        jest.runAllTimers();
        await Promise.resolve();

        const [res1, res2] = await Promise.all([result1, result2]);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/resolver/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                batch: [
                    { resolver: 'resolveUsers', params: { limit: 10 } },
                    { resolver: 'resolveUsers', params: { limit: 20 } },
                ],
            }),
        });
        expect(res1).toEqual({ users: { '1': { id: '1' } } });
        expect(res2).toEqual({ users: { '2': { id: '2' } } });
    });

    it('handles single resolver call without batching issues', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => [{ users: { '1': { id: '1' } } }],
        });

        const result = enqueueResolverCall('resolveUsers', { limit: 10 });

        jest.runAllTimers();
        await Promise.resolve();

        const res = await result;

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(res).toEqual({ users: { '1': { id: '1' } } });
    });

    it('rejects all promises when request fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            text: async () => 'Server error',
        });

        const result1 = enqueueResolverCall('resolveUsers', {});
        const result2 = enqueueResolverCall('resolveUsers', {});

        jest.runAllTimers();
        await Promise.resolve();

        await expect(result1).rejects.toThrow('Server error');
        await expect(result2).rejects.toThrow('Server error');
    });
});
