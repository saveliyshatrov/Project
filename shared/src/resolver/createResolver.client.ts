import { Collections } from './normalize.js';
import { ErrorType } from './types';

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

type Runner<Params, CollectionType> = (params: Params) => Promise<Collections<CollectionType, string> | ErrorType>;

export function createResolver<Params, CollectionType>(
    _func: Func<Params, CollectionType>,
    options: ResolverOptions
): Runner<Params, CollectionType> {
    return async (params: Params) => {
        const response = await fetch(`/resolver?resolver=${options.name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ params }),
        });

        if (!response.ok) {
            throw new Error(`Resolver "${options.name}" failed: ${response.statusText}`);
        }

        return (await response.json()) as Collections<CollectionType, string> | ErrorType;
    };
}
