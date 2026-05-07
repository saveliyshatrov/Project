import type { RootState, AppDispatch } from '@store';
import { updateWidgetData } from '@store/widget';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const WidgetContext = React.createContext<string | null>(null);

export function WidgetProvider({ id, children }: { id: string; children: React.ReactNode }) {
    return <WidgetContext.Provider value={id}>{children}</WidgetContext.Provider>;
}

export function useWidgetId(): string | null {
    return React.useContext(WidgetContext);
}

type Data = Record<string, unknown>;

type ScopedDispatch = (data: Data) => void;

export function useWidgetDispatch(): ScopedDispatch | null {
    const dispatch = useDispatch<AppDispatch>();
    const widgetId = useWidgetId();

    const customDispatch = useCallback(
        (data: Data) => {
            if (widgetId) {
                dispatch(updateWidgetData({ id: widgetId, data }));
            }
        },
        [dispatch, widgetId]
    );

    if (!widgetId) return null;

    return customDispatch;
}

type ScopedDispatchProps<MappedProps extends Data> = React.ComponentType<MappedProps & { dispatch: ScopedDispatch }>;

type MapStateToProps<OwnProps extends Data, MappedProps extends Data> = (
    widgetData: Data,
    ownProps: OwnProps
) => MappedProps;

export function connect<OwnProps extends Data, MappedProps extends Data>(
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
