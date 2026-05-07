import type { RootState, AppDispatch } from '@store';
import { updateWidgetData } from '@store/widgetSlice';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const WidgetContext = React.createContext<string | null>(null);

export function WidgetProvider({ id, children }: { id: string; children: React.ReactNode }) {
    return <WidgetContext.Provider value={id}>{children}</WidgetContext.Provider>;
}

export function useWidgetId(): string | null {
    return React.useContext(WidgetContext);
}

type ScopedDispatch = (data: Record<string, unknown>) => void;

export function useWidgetDispatch(): ScopedDispatch | null {
    const dispatch = useDispatch<AppDispatch>();
    const widgetId = useWidgetId();

    const customDispatch = useCallback(
        (data: Record<string, unknown>) => {
            if (widgetId) {
                dispatch(updateWidgetData({ id: widgetId, data }));
            }
        },
        [dispatch, widgetId]
    );

    if (!widgetId) return null;

    return customDispatch;
}

export function connect<OwnProps extends Record<string, unknown>, MappedProps extends Record<string, unknown>>(
    mapStateToProps: (widgetData: Record<string, unknown>, ownProps: OwnProps) => MappedProps
): (Component: React.ComponentType<MappedProps & { dispatch: ScopedDispatch }>) => React.ComponentType<OwnProps> {
    return (Component: React.ComponentType<MappedProps & { dispatch: ScopedDispatch }>) => {
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
