import { createWidget } from '@utils/global';

export const UserListWidget = createWidget({
    name: 'UserListWidget',
    loader: () => import(/* webpackChunkName: "UserListWidget" */ './widget'),
});
