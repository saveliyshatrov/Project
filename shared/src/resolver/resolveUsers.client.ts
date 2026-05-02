import { createResolver } from './createResolver';
import { Collections } from './normalize.js';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export const resolveUsers = createResolver<ResolveUsersParams, Collections<unknown>>(() => ({}), {
    name: 'resolveUsers',
});
