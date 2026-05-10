import React from 'react';

import { WidgetName, WidgetLoader, WidgetEntry, WidgetComponentType } from './types';

const widgetRegistry: Record<WidgetName, WidgetEntry> = {};

const lazyCache: Record<string, React.LazyExoticComponent<WidgetComponentType>> = {};

export function registerWidget(
    name: WidgetName,
    entry: { component: WidgetComponentType; displayName?: string }
): void {
    if (widgetRegistry[name]) {
        console.warn(`[WidgetRegistry] Widget "${name}" is already registered, overwriting.`);
    }
    widgetRegistry[name] = { type: 'sync', component: entry.component };
}

export function registerWidgetLazy(name: WidgetName, loader: WidgetLoader): void {
    if (widgetRegistry[name]) {
        console.warn(`[WidgetRegistry] Widget "${name}" is already registered, overwriting.`);
    }
    widgetRegistry[name] = { type: 'lazy', loader };
}

export function getWidget(
    name: WidgetName
): WidgetComponentType | React.LazyExoticComponent<WidgetComponentType> | null {
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
        delete widgetRegistry[key as WidgetName];
    }
    for (const key of Object.keys(lazyCache)) {
        delete lazyCache[key];
    }
}

export type { WidgetLoader };
