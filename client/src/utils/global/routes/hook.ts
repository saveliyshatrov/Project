import { ROUTE_NAMES, routeRegistry } from '@utils/global/routes';
import { matchPath, useLocation } from 'react-router';

export function usePageId(): string {
    const location = useLocation();
    const staticRoutes = routeRegistry.filter((r) => r.path !== '*');

    for (const route of staticRoutes) {
        if (matchPath(route.path, location.pathname)) {
            return route.pageId;
        }
    }

    const catchall = routeRegistry.find((r) => r.path === '*');
    return catchall?.pageId ?? ROUTE_NAMES.NOT_FOUND;
}
