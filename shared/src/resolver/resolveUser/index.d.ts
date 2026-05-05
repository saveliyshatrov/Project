import { Collections } from '../normalize';
import { User } from '../../constants';
import { ErrorType } from '../types';

export type ResolveUserParams = {
    id: string;
};

export declare const resolveUser: (params: ResolveUserParams) => Promise<Collections<User, 'users'> | ErrorType>;
