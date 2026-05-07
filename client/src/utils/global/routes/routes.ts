export const enum ROUTE_NAMES {
    HOME = 'home',
    USER_DETAILS = 'user-details',
    NOT_FOUND = 'not-found',
}

export const ROUTES = {
    [ROUTE_NAMES.HOME]: '/',
    [ROUTE_NAMES.USER_DETAILS]: '/users/:userId',
    [ROUTE_NAMES.NOT_FOUND]: '*',
} as const;
