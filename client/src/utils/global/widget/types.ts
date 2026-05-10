import React from 'react';

export type WidgetName = string & { __brand: 'WidgetName' };

export type WidgetId = string & { __brand: 'WidgetId' };

export type WidgetLoader = () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;

export type WidgetEntry =
    | { type: 'sync'; component: React.ComponentType<Record<string, unknown>> }
    | { type: 'lazy'; loader: WidgetLoader };

export type WidgetComponentType = React.ComponentType<Record<string, unknown>>;

export type WidgetParams = {
    name: string;
    loader: WidgetLoader;
};

export type ProviderProps = {
    id: WidgetId;
    children: React.ReactNode;
};

export type UpdateWidgetData = Record<string, unknown>;

export type ScopedDispatch = (data: UpdateWidgetData) => void;

export type ScopedDispatchProps<MappedProps extends UpdateWidgetData> = React.ComponentType<
    MappedProps & { dispatch: ScopedDispatch }
>;

export type MapStateToProps<OwnProps extends UpdateWidgetData, MappedProps extends UpdateWidgetData> = (
    widgetData: UpdateWidgetData,
    ownProps: OwnProps
) => MappedProps;
