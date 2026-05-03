import { User } from '../../constants';
import { createResolver } from '../createResolver';
import { Collections } from '../normalize';

export type ResolveUserParams = {
    id: string;
};

export const resolveUser = createResolver<ResolveUserParams, Collections<User, 'users'>>(() => ({}), {
    name: 'resolveUser',
});
