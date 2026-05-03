import React from 'react';

import { getWidget } from './registry';

type SlotProps = {
    name: string;
    props?: Record<string, unknown>;
    fallback?: React.ReactNode;
};

// @experimental - future thing - use widgets directly
export const Slot = ({ name, props = {}, fallback = null }: SlotProps) => {
    const Widget = getWidget(name);

    if (!Widget) {
        return <>{fallback}</>;
    }

    return <Widget {...props} />;
};
