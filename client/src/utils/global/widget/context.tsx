import type { AppDispatch } from '@store';
import { updateWidgetData } from '@store/widget';
import { ProviderProps, ScopedDispatch, UpdateWidgetData, WidgetId } from '@utils/global/widget/types';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

const WidgetContext = React.createContext<WidgetId | null>(null);

export const WidgetProvider: React.FC<ProviderProps> = ({ id, children }) => {
    return <WidgetContext.Provider value={id}>{children}</WidgetContext.Provider>;
};

export const useWidgetId = (): WidgetId | null => {
    return React.useContext(WidgetContext);
};

export const useWidgetDispatch = (): ScopedDispatch | null => {
    const dispatch = useDispatch<AppDispatch>();
    const widgetId = useWidgetId();

    const customDispatch = useCallback(
        (data: UpdateWidgetData) => {
            if (widgetId) {
                dispatch(updateWidgetData({ id: widgetId, data }));
            }
        },
        [dispatch, widgetId]
    );

    if (!widgetId) return null;

    return customDispatch;
};
