import React from 'react';

import { WidgetId } from './types';

export type WidgetErrorBoundaryProps = {
    onError: (id: WidgetId) => void;
    id: WidgetId;
    children: React.ReactNode;
    name: string;
};

export class WidgetErrorBoundary extends React.PureComponent<WidgetErrorBoundaryProps, unknown> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.warn(`[${this.props.name}] ${error.message}]`);
        console.warn(errorInfo);
        this.props.onError(this.props.id);
    }

    render() {
        return <>{this.props.children}</>;
    }
}
