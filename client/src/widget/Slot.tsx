import React, { Suspense } from 'react';

import { getWidget, hasWidget } from './registry';

type SlotProps = {
    name: string;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
};

export const Slot = ({ name, props = {}, fallback = null }: SlotProps) => {
    const Widget = getWidget(name);

    if (!Widget) {
        return <>{fallback}</>;
    }

    return (
        <Suspense fallback={fallback}>
            <Widget {...props} />
        </Suspense>
    );
};

export function isWidgetRegistered(name: string): boolean {
    return hasWidget(name);
}
