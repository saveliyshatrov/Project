import React from 'react';
import { User } from 'shared';

export type Props = {
    user?: User;
};

export const UserDetail: React.FC<Props> = () => {
    return <div>Loading...</div>;
};
