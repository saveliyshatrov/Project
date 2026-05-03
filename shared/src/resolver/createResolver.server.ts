import { Collections } from './normalize.js';

export type ResolverOptions = {
    name: string;
    sync?: boolean;
};

type Ctx = {
    isServer: boolean;
    [key: string]: unknown;
};

type Func<Params, CollectionType> = (
    ctx: Ctx,
    params: Params
) => Collections<CollectionType, string> | Promise<Collections<CollectionType, string>>;

type Promisable<T> = T | Promise<T>;

type Runner<Params, CollectionType> = (params: Params) => Promisable<Collections<CollectionType, string>>;

export const resolverRegistry = new Map<
    string,
    { func: (ctx: Ctx, params: unknown) => unknown; options: ResolverOptions }
>();

const CTX: Ctx = {
    isServer: true,
};

export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType> {
    resolverRegistry.set(options.name, { func: func as (ctx: Ctx, params: unknown) => unknown, options });

    if (options.sync) {
        return ((params: Params) => func(CTX, params)) as Runner<Params, CollectionType>;
    }

    return async (params: Params) => func(CTX, params);
}
