import { z } from 'zod';

import { createResolver, resolverRegistry } from '../src/resolver/createResolver.server';

describe('createResolver (server)', () => {
    beforeEach(() => {
        resolverRegistry.clear();
    });

    it('registers a resolver in the registry', () => {
        const func = async () => ({ users: {} });
        createResolver(func, { name: 'testResolver' });

        expect(resolverRegistry.has('testResolver')).toBe(true);
        expect(resolverRegistry.get('testResolver')?.options.name).toBe('testResolver');
    });

    it('registers a resolver with sync option', () => {
        const func = () => ({ users: {} });
        createResolver(func, { name: 'syncResolver', sync: true });

        expect(resolverRegistry.has('syncResolver')).toBe(true);
        expect(resolverRegistry.get('syncResolver')?.options.sync).toBe(true);
    });

    it('registers a resolver with schema', () => {
        const schema = z.object({ id: z.string() });
        const func = async () => ({ users: {} });
        createResolver(func, { name: 'schemaResolver' }, schema);

        expect(resolverRegistry.get('schemaResolver')?.schema).toBe(schema);
    });

    it('executes resolver function with valid params', async () => {
        const mockFunc = async (ctx: any, params: { id: string }) => ({
            users: { [params.id]: { id: params.id } },
        });
        createResolver(mockFunc, { name: 'execResolver' });

        const entry = resolverRegistry.get('execResolver');
        const result = await entry?.func({ isServer: true }, { id: '123' });

        expect(result).toEqual({ users: { '123': { id: '123' } } });
    });

    it('returns error for invalid params when schema is provided', async () => {
        const schema = z.object({ id: z.string().min(1) });
        const func = async () => ({ users: {} });
        createResolver(func, { name: 'validateResolver' }, schema);

        const entry = resolverRegistry.get('validateResolver');
        const result = await entry?.func({ isServer: true }, { id: '' });

        expect(result).toHaveProperty('error');
        expect((result as any).error).toContain('id');
    });

    it('succeeds when no schema is provided', async () => {
        const func = async () => ({ users: { a: { id: 'a' } } });
        createResolver(func, { name: 'noSchemaResolver' });

        const entry = resolverRegistry.get('noSchemaResolver');
        const result = await entry?.func({ isServer: true }, { any: 'params' });

        expect(result).toEqual({ users: { a: { id: 'a' } } });
    });

    it('sync resolver returns error for invalid params', async () => {
        const schema = z.object({ id: z.string().min(1) });
        const func = () => ({ users: {} });
        createResolver(func, { name: 'syncValidateResolver', sync: true }, schema);

        const entry = resolverRegistry.get('syncValidateResolver');
        const result = await entry?.func({ isServer: true }, { id: '' });

        expect(result).toHaveProperty('error');
    });

    it('sync resolver executes successfully with valid params', async () => {
        const func = () => ({ users: { b: { id: 'b' } } });
        createResolver(func, { name: 'syncExecResolver', sync: true });

        const entry = resolverRegistry.get('syncExecResolver');
        const result = await entry?.func({ isServer: true }, {});

        expect(result).toEqual({ users: { b: { id: 'b' } } });
    });

    it('preserves multiple resolvers in registry', () => {
        createResolver(async () => ({}), { name: 'resolver1' });
        createResolver(async () => ({}), { name: 'resolver2' });
        createResolver(async () => ({}), { name: 'resolver3' });

        expect(resolverRegistry.size).toBe(3);
    });

    it('passes context to resolver function', async () => {
        let receivedCtx: any;
        const func = async (ctx: any) => {
            receivedCtx = ctx;
            return { users: {} };
        };
        createResolver(func, { name: 'ctxResolver' });

        const entry = resolverRegistry.get('ctxResolver');
        const testCtx = { isServer: true, userId: '456' };
        await entry?.func(testCtx, {});

        expect(receivedCtx).toEqual(testCtx);
    });
});
