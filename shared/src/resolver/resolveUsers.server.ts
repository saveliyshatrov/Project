import { User } from '../constants';

import { createResolver } from './createResolver';
import { normalize } from './normalize';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, User>(
    async (ctx, params) => {
        const users: User[] = [
            { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
            { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
            { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' },
            { id: '4', name: 'Diana Prince', email: 'diana@example.com' },
            { id: '5', name: 'Eve Wilson', email: 'eve@example.com' },
        ];

        const offset = params.offset ?? 0;
        const limit = params.limit ?? users.length;
        const sliced = users.slice(offset, offset + limit);

        return normalize<User>((user) => user.id)(sliced, 'users');
    },
    { name: 'resolveUsers' }
);
