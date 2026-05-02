import { Collections } from './normalize.js';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export declare const resolveUsers: (
    params: ResolveUsersParams
) => Promise<Collections<{ id: string; name: string; email: string }>>;
