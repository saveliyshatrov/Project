import React from 'react';

import { registerWidgetLazy } from './registry';
import { WidgetName, WidgetParams } from './types';

export { connect } from './connect';

export { useWidgetId, useWidgetDispatch, WidgetProvider } from './context';

export { ROUTES, buildPath, type ExtractRouteParams } from '@utils/global/routes';

export const createWidget = ({ name, loader }: WidgetParams) => {
    registerWidgetLazy(name as WidgetName, loader);
    return React.lazy(loader);
};

export { registerWidgetLazy } from './registry';
export * from './types';
export { createWidgetShell } from './WidgetShell';
export type { ControllerFunction } from './WidgetShell';
export type { WidgetCtx } from './WidgetShell';
