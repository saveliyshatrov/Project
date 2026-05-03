import { type Props } from '@components/UserDetail';
import { CollectionState } from '@store/collectionsSlice';
import { ControllerFunction } from '@widget/WidgetShell';
import { resolveUser } from 'shared/resolver';

export type ControllerData = unknown;
export type CollectionData = CollectionState;

export const controller: ControllerFunction<ControllerData, Props, CollectionData> = async ({ ctx }) => {
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
};
