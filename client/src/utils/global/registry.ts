import React from 'react';

type WidgetLoader = () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;

type WidgetEntry =
    | { type: 'sync'; component: React.ComponentType<Record<string, unknown>> }
    | { type: 'lazy'; loader: WidgetLoader };

const widgetRegistry: Record<string, WidgetEntry> = {};
const lazyCache: Record<string, React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>> = {};

export function registerWidget(
    name: string,
    entry: { component: React.ComponentType<Record<string, unknown>>; displayName?: string }
): void {
    if (widgetRegistry[name]) {
        console.warn(`[WidgetRegistry] Widget "${name}" is already registered, overwriting.`);
    }
    widgetRegistry[name] = { type: 'sync', component: entry.component };
}

export function registerWidgetLazy(name: string, loader: WidgetLoader): void {
    if (widgetRegistry[name]) {
        console.warn(`[WidgetRegistry] Widget "${name}" is already registered, overwriting.`);
    }
    widgetRegistry[name] = { type: 'lazy', loader };
}

export function getWidget(
    name: string
):
    | React.ComponentType<Record<string, unknown>>
    | React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>
    | null {
    const entry = widgetRegistry[name];
    if (!entry) return null;
    if (entry.type === 'sync') return entry.component;
    if (!lazyCache[name]) {
        lazyCache[name] = React.lazy(entry.loader);
    }
    return lazyCache[name];
}

export function hasWidget(name: string): boolean {
    return name in widgetRegistry;
}

export function clearWidgetRegistry(): void {
    for (const key of Object.keys(widgetRegistry)) {
        delete widgetRegistry[key];
    }
    for (const key of Object.keys(lazyCache)) {
        delete lazyCache[key];
    }
}

export type { WidgetLoader };
