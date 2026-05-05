import { createWidget } from '@utils/global';

export const UserDetailWidget = createWidget({
    name: 'UserDetailWidget',
    loader: () => import(/* webpackChunkName: "UserDetailWidget" */ './widget'),
});
