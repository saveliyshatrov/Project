import { clearWidgetData } from '@store/widget';
import React, { Suspense, useEffect, useLayoutEffect } from 'react';
import { useDispatch } from 'react-redux';

import { WidgetProvider } from './connect';
import { getWidget, hasWidget } from './registry';

let instanceCounter = 0;

type SlotProps = {
    name: string;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
};

const createWidgetUniqName = (name: string) => {
    return `*Widget-${name}-${++instanceCounter}`;
};

export const Slot = ({ name, props = {}, fallback = null }: SlotProps) => {
    const [widgetInstanceId, updateInstance] = React.useState(createWidgetUniqName(name));
    const dispatch = useDispatch();

    useEffect(() => {
        updateInstance(createWidgetUniqName(name));
    }, [name]);

    useLayoutEffect(() => {
        return () => {
            dispatch(clearWidgetData(widgetInstanceId));
        };
    }, [name]);

    const Widget = getWidget(name);

    if (!Widget) {
        return <>{fallback}</>;
    }

    return (
        <Suspense fallback={fallback}>
            <WidgetProvider id={widgetInstanceId}>
                <Widget {...props} />
            </WidgetProvider>
        </Suspense>
    );
};

export function isWidgetRegistered(name: string): boolean {
    return hasWidget(name);
}
