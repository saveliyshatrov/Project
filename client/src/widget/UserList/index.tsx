import { createWidget } from '@utils/global/widget';

export const UserListWidget = createWidget({
    name: 'UserListWidget',
    loader: () => import(/* webpackChunkName: "UserListWidget" */ './widget'),
});
