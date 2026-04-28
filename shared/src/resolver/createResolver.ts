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

type Func<Params> = (ctx: Ctx, params: Params) => any

type ArgFunc = <Params>
(callback: Func<Params>, options: ResolverOptions) => (params: Params) => ResolverOptions['sync'] extends true ? ReturnType<Func<Params>> : Promisable<ReturnType<Func<Params>>>

const CTX = {
    isServer: !process.env.CLIENT
}

export const createResolver: ArgFunc = function(func, options) {
    if (options.sync) {
        return (params) => func(CTX satisfies Ctx, params);
    }
    return async (params) => {
        return func(CTX satisfies Ctx, params)
    }
}

export const resolverExample = createResolver(async () => {
    const users = await fetch('http://localhost:3001/users', {
        method: 'GET'
    }).then(response => response.json());
    return {
        users
    };
}, { name: 'resolverExample' });