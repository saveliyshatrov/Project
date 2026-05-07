import { createWidget } from '@utils/global/widget';

export const NotFoundWidget = createWidget({
    name: 'NotFoundWidget',
    loader: () => import(/* webpackChunkName: "NotFoundWidget" */ './widget'),
});
