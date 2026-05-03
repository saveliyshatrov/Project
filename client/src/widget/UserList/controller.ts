import { type Props } from '@components/UserList';
import { CollectionState } from '@store/collectionsSlice';
import { ControllerFunction } from '@widget/WidgetShell';
import { resolveUsers } from 'shared/resolver';

export type ControllerData = unknown;
export type CollectionData = CollectionState;

export const controller: ControllerFunction<ControllerData, Props, CollectionData> = async () => {
    const userCollection = await resolveUsers({ limit: 10 });
    return {
        data: {
            users: Object.values(userCollection.users),
        },
    };
};
