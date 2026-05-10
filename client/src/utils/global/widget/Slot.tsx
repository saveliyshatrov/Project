import { clearWidgetData } from '@store/widget';
import React, { Suspense, useCallback, useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';

import { WidgetProvider } from './context';
import { getWidget, hasWidget } from './registry';
import { WidgetId, WidgetName } from './types';
import { WidgetErrorBoundary } from './widgetErrorBoundary';

let instanceCounter = 0;

type SlotProps = {
    name: WidgetName;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
};

const createWidgetUniqName = (name: WidgetName) => {
    return `*Widget-${name}-${++instanceCounter}` as WidgetId;
};

export const Slot = ({ name, props = {}, fallback = null }: SlotProps) => {
    const [widgetInstanceId, updateInstance] = React.useState(createWidgetUniqName(name));
    const dispatch = useDispatch();

    const clearData = useCallback((widgetInstanceId: WidgetId) => {
        dispatch(clearWidgetData(widgetInstanceId));
    }, []);

    useEffect(() => {
        updateInstance(createWidgetUniqName(name));
    }, [name]);

    useLayoutEffect(() => {
        return () => {
            clearData(widgetInstanceId);
        };
    }, [name]);

    const Widget = getWidget(name);

    if (!Widget) {
        return <>{fallback}</>;
    }

    return (
        <Suspense fallback={fallback}>
            <WidgetErrorBoundary id={widgetInstanceId} onError={clearData} name={name}>
                <WidgetProvider id={widgetInstanceId}>
                    <Widget {...props} />
                </WidgetProvider>
            </WidgetErrorBoundary>
        </Suspense>
    );
};

export function isWidgetRegistered(name: WidgetName): boolean {
    return hasWidget(name);
}
