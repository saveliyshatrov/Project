import { ZodType } from 'zod';

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

type Promisable<T> = T | Promise<T>;

type Func<Params, CollectionType> = (ctx: Ctx, params: Params) => Promisable<Collections<CollectionType, string>>;

export const resolverRegistry = new Map<
    string,
    { func: (ctx: Ctx, params: unknown) => Promisable<unknown>; options: ResolverOptions; schema?: ZodType }
>();

const validateParams = <Params>(params: Params, schema?: ZodType) => {
    if (!schema) {
        return {
            success: true,
        };
    }

    const schemaTest = schema.safeParse(params);

    if (schemaTest.success) {
        return {
            success: true,
        };
    }

    const error =
        schemaTest.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Invalid Params';

    return {
        error,
    };
};

export function createResolver<Params, CollectionType>(
    func: Func<Params, CollectionType>,
    options: ResolverOptions,
    schema?: ZodType
) {
    if (options.sync) {
        const newFunc = (ctx: Ctx, params: Params) => {
            const { error, success } = validateParams(params, schema);
            if (success) {
                return func(ctx, params);
            }

            return {
                error,
            };
        };

        resolverRegistry.set(options.name, {
            func: newFunc as (ctx: Ctx, params: unknown) => Promisable<unknown | ErrorType>,
            options,
            schema,
        });
        return;
    }

    const newFunc = async (ctx: Ctx, params: Params) => {
        const { error, success } = validateParams(params, schema);
        if (success) {
            return func(ctx, params);
        }

        return {
            error,
        };
    };

    resolverRegistry.set(options.name, {
        func: newFunc as (ctx: Ctx, params: unknown) => Promisable<unknown | ErrorType>,
        options,
        schema,
    });
}
