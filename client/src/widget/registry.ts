import React from 'react';

type WidgetEntry = {
    component: React.ComponentType<Record<string, unknown>>;
    displayName: string;
};

const registry = new Map<string, WidgetEntry>();

export function registerWidget(name: string, entry: WidgetEntry): void {
    if (registry.has(name)) {
        console.warn(`[WidgetRegistry] Widget "${name}" is already registered, overwriting.`);
    }
    registry.set(name, entry);
}

export function getWidget(name: string): React.ComponentType<Record<string, unknown>> | null {
    const entry = registry.get(name);
    return entry?.component ?? null;
}

export function hasWidget(name: string): boolean {
    return registry.has(name);
}
