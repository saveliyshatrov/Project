import { Link } from '@utils/global/routes';
import React from 'react';
import { formatUser } from 'shared/constants';

import type { Props } from './index';

export const UserDetail: React.FC<Props> = ({ user }) => {
    return (
        <div>
            <div>Desktop user</div>
            <Link to="/">← Back to users</Link>
            {user && <div>{formatUser(user)}</div>}
            {!user && <div>No user with this id</div>}
        </div>
    );
};
