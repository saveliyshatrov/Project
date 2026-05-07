import '@widget/UserDetail';
import '@widget/UserList';
import '@widget/NotFound';
import { RouteConfig, ROUTES, ROUTE_NAMES } from '@utils/global/routes';

export const routeRegistry: RouteConfig[] = [
    {
        path: ROUTES[ROUTE_NAMES.HOME],
        widgetName: 'UserListWidget',
        pageId: ROUTE_NAMES.HOME,
    },
    {
        path: ROUTES[ROUTE_NAMES.USER_DETAILS],
        widgetName: 'UserDetailWidget',
        pageId: ROUTE_NAMES.USER_DETAILS,
    },
    {
        path: ROUTES[ROUTE_NAMES.NOT_FOUND],
        widgetName: 'NotFoundWidget',
        pageId: ROUTE_NAMES.NOT_FOUND,
    },
];
