import React from 'react';
import type { User } from 'shared';

export type Props = {
    users: User[];
};

export const UserList: React.FC<Props> = () => {
    return <div>Loading...</div>;
};
