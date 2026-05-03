import { Collections } from '../normalize';
import { User } from '../../constants';

type ResolveUsersParams = {
    limit?: number;
    offset?: number;
};

export declare const resolveUsers: (params: ResolveUsersParams) => Promise<Collections<User>>;
