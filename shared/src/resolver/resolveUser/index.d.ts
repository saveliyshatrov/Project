import { Collections } from '../normalize';
import { User } from '../../constants';

export type ResolveUserParams = {
    id: string;
};

export declare const resolveUser: (params: ResolveUserParams) => Promise<Collections<User, 'users'>>;
