import type { RootState } from '@store';
import React from 'react';
import { useSelector } from 'react-redux';

import { useWidgetId, useWidgetDispatch } from './context';
import { UpdateWidgetData, ScopedDispatchProps, MapStateToProps } from './types';

export function connect<OwnProps extends UpdateWidgetData, MappedProps extends UpdateWidgetData>(
    mapStateToProps: MapStateToProps<OwnProps, MappedProps>
): (Component: ScopedDispatchProps<MappedProps>) => React.ComponentType<OwnProps> {
    return (Component: ScopedDispatchProps<MappedProps>) => {
        const Wrapped = (ownProps: OwnProps) => {
            const widgetId = useWidgetId();
            const widgetData = useSelector((state: RootState) => (widgetId ? (state.widget[widgetId] ?? {}) : {}));
            const dispatch = useWidgetDispatch();
            const mappedProps = mapStateToProps(widgetData, ownProps);

            return <Component {...ownProps} {...mappedProps} dispatch={dispatch ?? (() => {})} />;
        };

        Wrapped.displayName = `Connect(${Component.displayName || Component.name})`;

        return Wrapped;
    };
}
