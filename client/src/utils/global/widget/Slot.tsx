import React, { Suspense } from 'react';

import { WidgetProvider } from './connect';
import { getWidget, hasWidget } from './registry';

let instanceCounter = 0;

type SlotProps = {
    name: string;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
};

export const Slot = ({ name, props = {}, fallback = null }: SlotProps) => {
    const [widgetInstanceId] = React.useState(() => `*Widget-${name}-${++instanceCounter}`);

    const Widget = getWidget(name);

    if (!Widget) {
        return <>{fallback}</>;
    }

    return (
        <WidgetProvider id={widgetInstanceId}>
            <Suspense fallback={fallback}>
                <Widget {...props} />
            </Suspense>
        </WidgetProvider>
    );
};

export function isWidgetRegistered(name: string): boolean {
    return hasWidget(name);
}
