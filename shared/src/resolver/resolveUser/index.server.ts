import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { normalize } from '../normalize';

export type ResolveUserParams = {
    id: string;
};

export const resolveUser = createResolver<ResolveUserParams, User>(
    async (ctx, params) => {
        const { user } = await fetch(`http://localhost:3001/users/${params.id}`).then((response) => response.json());

        if (!user) {
            return {
                users: {},
            };
        }

        return normalize<User>((user) => user.id)([user], 'users');
    },
    { name: 'resolveUser' }
);
