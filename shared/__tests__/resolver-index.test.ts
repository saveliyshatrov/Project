import { createResolver, resolverRegistry } from '../src/resolver/createResolver.server';
import * as resolver from '../src/resolver/index';
import { normalize } from '../src/resolver/normalize';

describe('resolver index exports', () => {
    it('exports normalize', () => {
        expect(resolver.normalize).toBe(normalize);
    });

    it('exports createResolver', () => {
        expect(resolver.createResolver).toBe(createResolver);
    });

    it('exports resolverRegistry', () => {
        expect(resolver.resolverRegistry).toBe(resolverRegistry);
    });
});
