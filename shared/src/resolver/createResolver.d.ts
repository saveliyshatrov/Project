import { Collections } from './normalize.js';
import { ZodType } from 'zod';
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
) => Collections<CollectionType> | Promise<Collections<CollectionType>>;

export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions,
    schema?: ZodType
): (params: Params) => Promise<Collections<CollectionType> | ErrorType>;
