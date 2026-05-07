import { Collections } from './normalize.js';
import { enqueueResolverCall } from './resolverBatch';
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
        return enqueueResolverCall(options.name, params) as Promise<Collections<CollectionType, string> | ErrorType>;
    };
}
