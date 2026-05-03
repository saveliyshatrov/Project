import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { normalize } from '../normalize';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, User>(
    async (ctx, params) => {
        const users = await fetch('http://localhost:3001/users').then((response) => response.json());

        const offset = params.offset ?? 0;
        const limit = params.limit ?? users.length;
        const sliced = users.slice(offset, offset + limit);

        return normalize<User>((user) => user.id)(sliced, 'users');
    },
    { name: 'resolveUsers' }
);
