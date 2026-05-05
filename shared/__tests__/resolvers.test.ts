import { resolverRegistry } from '../src/resolver/createResolver.server';
import '../src/resolver/resolveUser/index.server';
import '../src/resolver/resolveUsers/index.server';

const originalFetch = global.fetch;

beforeAll(() => {
    global.fetch = jest.fn();
});

afterAll(() => {
    global.fetch = originalFetch;
});

describe('resolveUser (server)', () => {
    it('is registered in resolver registry', () => {
        expect(resolverRegistry.has('resolveUser')).toBe(true);
    });

    it('has correct resolver options', () => {
        const entry = resolverRegistry.get('resolveUser');
        expect(entry?.options.name).toBe('resolveUser');
        expect(entry?.schema).toBeDefined();
    });

    it('validates params with schema - empty id', async () => {
        const entry = resolverRegistry.get('resolveUser');
        const result = await entry?.func({ isServer: true }, { id: '' });
        expect(result).toHaveProperty('error');
    });

    it('fetches and normalizes user data on success', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ user: { id: '1', name: 'Test' } }),
        });

        const entry = resolverRegistry.get('resolveUser');
        const result = await entry?.func({ isServer: true }, { id: '1' });

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/users/1');
        expect(result).toEqual({ users: { '1': { id: '1', name: 'Test' } } });
    });

    it('returns empty users when user not found', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => ({ user: null }),
        });

        const entry = resolverRegistry.get('resolveUser');
        const result = await entry?.func({ isServer: true }, { id: '999' });

        expect(result).toEqual({ users: {} });
    });
});

describe('resolveUsers (server)', () => {
    it('is registered in resolver registry', () => {
        expect(resolverRegistry.has('resolveUsers')).toBe(true);
    });

    it('has correct resolver options', () => {
        const entry = resolverRegistry.get('resolveUsers');
        expect(entry?.options.name).toBe('resolveUsers');
    });

    it('fetches and normalizes users with default params', async () => {
        const mockUsers = [
            { id: '1', name: 'A' },
            { id: '2', name: 'B' },
        ];
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => mockUsers,
        });

        const entry = resolverRegistry.get('resolveUsers');
        const result = await entry?.func({ isServer: true }, {});

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/users');
        expect(result).toEqual({
            users: {
                '1': { id: '1', name: 'A' },
                '2': { id: '2', name: 'B' },
            },
        });
    });

    it('applies limit and offset params', async () => {
        const mockUsers = [
            { id: '1', name: 'A' },
            { id: '2', name: 'B' },
            { id: '3', name: 'C' },
        ];
        (global.fetch as jest.Mock).mockResolvedValue({
            json: async () => mockUsers,
        });

        const entry = resolverRegistry.get('resolveUsers');
        const result = await entry?.func({ isServer: true }, { limit: 2, offset: 1 });

        expect(result).toEqual({
            users: {
                '2': { id: '2', name: 'B' },
                '3': { id: '3', name: 'C' },
            },
        });
    });
});
