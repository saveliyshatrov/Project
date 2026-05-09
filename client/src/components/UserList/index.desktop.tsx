import { Link } from '@utils/global/routes';
import React from 'react';
import { formatUser } from 'shared/constants';

import type { Props } from './index';

export const UserList: React.FC<Props> = ({ users }) => {
    return (
        <div>
            <div>Desktop users</div>
            {users.map((user) => {
                return (
                    <li key={`${user.name}|${user.id}`}>
                        <Link to={`/users/${user.id}`} key={`${user.name}|${user.id}`}>
                            {formatUser(user)}
                        </Link>
                    </li>
                );
            })}
        </div>
    );
};
