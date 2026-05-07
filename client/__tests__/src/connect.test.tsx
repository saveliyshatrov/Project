import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { store } from '../../src/store';
import { updateWidgetData } from '../../src/store/widget';
import { WidgetProvider, connect, useWidgetDispatch } from '../../src/utils/global/widget/connect';

describe('connect HOC', () => {
    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>{ui}</MemoryRouter>
            </Provider>
        );
    };

    afterEach(() => {
        const state = store.getState();
        Object.keys(state.widget).forEach((key) => {
            store.dispatch(updateWidgetData({ id: key, data: {} }));
        });
    });

    it('provides widget data to wrapped component', () => {
        store.dispatch(updateWidgetData({ id: '*Widget-TestWidget-1', data: { message: 'Hello from widget' } }));

        const Inner = ({ message }: { message: string }) => <div data-testid="inner">{message}</div>;

        const ConnectedInner = connect<Record<string, unknown>, { message: string }>((widgetData) => ({
            message: (widgetData as { message?: string }).message ?? '',
        }))(Inner as React.ComponentType<{ message: string } & { dispatch: (data: Record<string, unknown>) => void }>);

        renderWithProviders(
            <WidgetProvider id="*Widget-TestWidget-1">
                <ConnectedInner />
            </WidgetProvider>
        );

        expect(screen.getByTestId('inner')).toHaveTextContent('Hello from widget');
    });

    it('provides scoped dispatch that updates widget data', () => {
        let capturedDispatch: ((data: Record<string, unknown>) => void) | null = null;

        const Inner = ({ dispatch: d }: { dispatch: (data: Record<string, unknown>) => void }) => {
            capturedDispatch = d;
            return <div data-testid="dispatch-inner">Ready</div>;
        };

        const ConnectedInner = connect<Record<string, unknown>, Record<string, unknown>>(() => ({}))(Inner);

        renderWithProviders(
            <WidgetProvider id="*Widget-DispatchTest-1">
                <ConnectedInner />
            </WidgetProvider>
        );

        capturedDispatch!({ custom: 'data' });

        const state = store.getState();
        expect(state.widget['*Widget-DispatchTest-1']).toEqual({ custom: 'data' });
    });

    it('returns empty data when connect is used outside WidgetProvider', () => {
        const Inner = () => <div data-testid="outside">rendered</div>;
        const ConnectedInner = connect<Record<string, unknown>, Record<string, unknown>>(() => ({}))(Inner);

        const { getByTestId } = renderWithProviders(<ConnectedInner />);
        expect(getByTestId('outside')).toHaveTextContent('rendered');
    });

    it('returns empty object when no widget data exists', () => {
        const Inner = ({ value }: { value: string }) => <div data-testid="empty">{value}</div>;

        const ConnectedInner = connect<Record<string, unknown>, { value: string }>((widgetData) => ({
            value: (widgetData as { value?: string }).value ?? 'default',
        }))(Inner as React.ComponentType<{ value: string } & { dispatch: (data: Record<string, unknown>) => void }>);

        renderWithProviders(
            <WidgetProvider id="*Widget-Empty-1">
                <ConnectedInner />
            </WidgetProvider>
        );

        expect(screen.getByTestId('empty')).toHaveTextContent('default');
    });
});

describe('useWidgetDispatch', () => {
    it('returns null outside WidgetProvider', () => {
        let capturedDispatch: ReturnType<typeof useWidgetDispatch> = null;

        const TestComponent = () => {
            capturedDispatch = useWidgetDispatch();
            return null;
        };

        render(
            <Provider store={store}>
                <TestComponent />
            </Provider>
        );

        expect(capturedDispatch).toBeNull();
    });
});
