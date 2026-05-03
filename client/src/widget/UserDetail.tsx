import { UserDetail } from '@components/UserDetail';
import { createWidget } from '@widget/index';
import React from 'react';
import { resolveUser } from 'shared/resolver';

export const UserDetailWidget = createWidget({
    view: UserDetail,
    controller: async ({ id }: { id?: string }) => {
        if (!id) {
            return {};
        }
        const userCollection = await resolveUser({ id });
        return {
            data: {
                user: userCollection.users[id],
            },
        };
    },
    skeleton: () => <div>UserDetail</div>,
});
