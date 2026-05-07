import { createWidget } from '@utils/global/widget';

export const UserDetailWidget = createWidget({
    name: 'UserDetailWidget',
    loader: () => import(/* webpackChunkName: "UserDetailWidget" */ './widget'),
});
