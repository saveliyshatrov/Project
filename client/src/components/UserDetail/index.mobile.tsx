import React from 'react';
import { Link } from 'react-router-dom';
import { formatUser } from 'shared';

import type { Props } from './index';

export const UserDetail: React.FC<Props> = ({ user }) => {
    return (
        <div>
            <div>Mobile user</div>
            <Link to="/">← Back to users</Link>
            {user && <div>{formatUser(user)}</div>}
            {!user && <div>No user with this id</div>}
        </div>
    );
};
