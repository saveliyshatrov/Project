import { rerenderWidget } from '@store/widgets';
import React from 'react';

import { registerWidgetLazy } from './registry';
export type { WidgetCtx } from './WidgetShell';
export type { ControllerFunction } from './WidgetShell';
export { createWidgetShell } from './WidgetShell';

export { rerenderWidget };

export { connect, useWidgetId, useWidgetDispatch, WidgetProvider } from './connect';

export { ROUTES, buildPath, type ExtractRouteParams } from '@utils/global/routes';

type WidgetLoader = () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;

type WidgetParams = {
    name: string;
    loader: WidgetLoader;
};

export const createWidget = ({ name, loader }: WidgetParams) => {
    registerWidgetLazy(name, loader);
    if (process.env.SSR) {
        return null;
    }
    return React.lazy(loader);
};

export { registerWidgetLazy } from './registry';
