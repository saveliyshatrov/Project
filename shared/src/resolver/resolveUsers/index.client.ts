import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { Collections } from '../normalize';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, Collections<User, 'users'>>(() => ({}), {
    name: 'resolveUsers',
});
