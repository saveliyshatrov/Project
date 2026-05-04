import { rerenderWidget } from '@store/collectionsSlice';
import React from 'react';

import { registerWidgetLazy } from './registry';

export type { WidgetCtx } from './WidgetShell';
export type { ControllerFunction } from './WidgetShell';

export { createWidgetShell } from './WidgetShell';

export { rerenderWidget };

type WidgetLoader = () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;

type WidgetParams = {
    name: string;
    loader: WidgetLoader;
};

export const createWidget = ({ name, loader }: WidgetParams) => {
    registerWidgetLazy(name, loader);
    return React.lazy(loader);
};

export { registerWidgetLazy } from './registry';
