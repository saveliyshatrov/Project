import { UserList as view, type Props } from '@components/UserList';
import { createWidget } from '@widget/index';
import React from 'react';
import { resolveUsers } from 'shared/resolver';

export const UserListWidget = createWidget<Props, object>({
    view,
    controller: async () => {
        const userCollection = await resolveUsers({ limit: 10 });
        return {
            data: {
                users: Object.values(userCollection.users),
            },
        };
    },
    skeleton: () => <div>UserList</div>,
});
