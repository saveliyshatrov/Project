export type ExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof ExtractRouteParams<Rest>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;

export function buildPath<T extends string>(
    path: T,
    ...[params]: ExtractRouteParams<T> extends Record<string, never> ? [] : [ExtractRouteParams<T>]
): string {
    if (!params) return path;
    let result = path as string;
    for (const [key, value] of Object.entries(params as Record<string, string>)) {
        result = result.replace(`:${key}`, encodeURIComponent(value));
    }
    return result;
}

export type RouteConfig = {
    path: string;
    widgetName: string;
    pageId: string;
};
