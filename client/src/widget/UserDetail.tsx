import { UserDetail as view } from '@components/UserDetail';
import { createWidget } from '@widget/index';
import React from 'react';
import { resolveUser } from 'shared/resolver';

export const UserDetailWidget = createWidget({
    view,
    controller: async ({ ctx }) => {
        const { userId } = ctx.page.params;
        if (!userId) {
            return {};
        }
        const userCollection = await resolveUser({ id: userId });
        return {
            data: {
                user: userCollection.users[userId],
            },
        };
    },
    skeleton: () => <div>UserDetail</div>,
});
