import {Collections, CollectionState} from "./normalize";

type ResolverOptions = {
    name: string;
    // if flag true arg func could be only sync
    sync?: boolean;
}

type Promisable<T> = T | Promise<T>;

type Ctx = {
    isServer: boolean;
    [key: string]: any;
}

type Func<Params, CollectionType> = (ctx: Ctx, params: Params) => Promisable<Collections<CollectionType>>;

type Runner<Params, CollectionType> = (params: Params) => ResolverOptions['sync'] extends true ?
    ReturnType<Func<Params, CollectionType>> :
    Promisable<ReturnType<Func<Params, CollectionType>>>

type ArgFunc<Params, CollectionType> =
(callback: Func<Params, CollectionType>, options: ResolverOptions) =>
    Runner<Params, CollectionType>

const CTX = {
    isServer: !process.env.CLIENT
}

export function createResolver<Params, CollectionType>(func: Func<Params, CollectionType>, options: ResolverOptions): Runner<Params, CollectionType> {
    if (options.sync) {
        return (params) => func(CTX satisfies Ctx, params);
    }
    return async (params) => {
        return func(CTX satisfies Ctx, params)
    };
}