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
) => Collections<CollectionType> | Promise<Collections<CollectionType>>;

type Runner<Params, CollectionType> = (params: Params) => Promise<Collections<CollectionType>>;

export function createResolver<Params, CollectionType>(
    _func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType> {
    return async (params: Params) => {
        const query = new URLSearchParams({
            resolver: options.name,
            params: JSON.stringify(params),
        });

        const response = await fetch(`/resolver?${query.toString()}`);

        if (!response.ok) {
            throw new Error(`Resolver "${options.name}" failed: ${response.statusText}`);
        }

        return (await response.json()) as Collections<CollectionType>;
    };
}
