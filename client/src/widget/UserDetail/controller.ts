import { type Props } from '@components/UserDetail';
import { CollectionState } from '@store/collections';
import { ROUTE_NAMES, ROUTES, type ExtractRouteParams } from '@utils/global/routes';
import { ControllerFunction } from '@utils/global/widget/WidgetShell';
import { resolveUser } from 'shared/resolver';

export type UserDetailParams = ExtractRouteParams<(typeof ROUTES)[ROUTE_NAMES.USER_DETAILS]>;

export type ControllerData = unknown;
export type CollectionData = CollectionState;

export type ControllerType = ControllerFunction<ControllerData, Props, CollectionData, UserDetailParams>;

export const controller: ControllerType = async ({ ctx }) => {
    const { userId } = ctx.page.params;
    if (!userId) return {};
    const userCollection = await resolveUser({ id: userId });
    return {
        data: {
            user: userCollection.users[userId],
        },
    };
};
