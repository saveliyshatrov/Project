import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { store } from '../../src/store';
import { rerenderWidget } from '../../src/store/collectionsSlice';
import { createWidgetShell } from '../../src/utils/global/WidgetShell';

describe('WidgetShell', () => {
    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <MemoryRouter>{ui}</MemoryRouter>
            </Provider>
        );
    };

    it('shows skeleton while loading', async () => {
        let resolveController: () => void;
        const controllerPromise = new Promise<void>((resolve) => {
            resolveController = resolve;
        });

        const TestWidget = createWidgetShell({
            name: 'TestWidget',
            view: () => <div data-testid="view">View</div>,
            controller: async () => {
                await controllerPromise;
                return { data: {} };
            },
            skeleton: () => <div data-testid="skeleton">Loading...</div>,
        });

        renderWithProviders(<TestWidget />);

        expect(screen.getByTestId('skeleton')).toBeInTheDocument();

        await act(async () => {
            resolveController!();
        });

        await waitFor(() => {
            expect(screen.getByTestId('view')).toBeInTheDocument();
        });
    });

    it('renders view after controller resolves', async () => {
        const TestWidget = createWidgetShell({
            name: 'TestWidget2',
            view: () => <div data-testid="view2">View Content</div>,
            controller: async () => ({ data: {} }),
        });

        renderWithProviders(<TestWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('view2')).toBeInTheDocument();
        });
    });

    it('renders null when controller returns null', async () => {
        const TestWidget = createWidgetShell({
            name: 'TestWidget3',
            view: () => <div data-testid="view3">Should Not Render</div>,
            controller: async () => null,
        });

        const { container } = renderWithProviders(<TestWidget />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('passes controller data to view', async () => {
        const TestView = ({ message }: { message: string }) => <div data-testid="view4">{message}</div>;

        const TestWidget = createWidgetShell({
            name: 'TestWidget4',
            view: TestView,
            controller: async () => ({ data: { message: 'Hello from controller' } }),
        });

        renderWithProviders(<TestWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('view4')).toHaveTextContent('Hello from controller');
        });
    });

    it('updates collections from controller result', async () => {
        const TestWidget = createWidgetShell({
            name: 'TestWidget5',
            view: () => <div data-testid="view5">Done</div>,
            controller: async () => ({
                collections: {
                    users: { '1': { id: '1', name: 'Test' } },
                },
            }),
        });

        renderWithProviders(<TestWidget />);

        await waitFor(() => {
            const state = store.getState();
            expect(state.collections.collections.users).toHaveProperty('1');
        });
    });

    it('handles controller errors gracefully', async () => {
        const TestWidget = createWidgetShell({
            name: 'TestWidget6',
            view: () => <div data-testid="view6">Should Not Render</div>,
            skeleton: () => <div data-testid="skeleton6">Loading...</div>,
            controller: async () => {
                throw new Error('Controller error');
            },
        });

        const { container } = renderWithProviders(<TestWidget />);

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('re-runs controller on rerenderWidget action', async () => {
        let callCount = 0;

        const TestView = ({ count }: { count: number }) => <div data-testid="view7">Count: {count}</div>;

        const TestWidget = createWidgetShell({
            name: 'TestWidget7',
            view: TestView,
            controller: async () => {
                callCount++;
                return { data: { count: callCount } };
            },
        });

        renderWithProviders(<TestWidget />);

        await waitFor(() => {
            expect(screen.getByTestId('view7')).toHaveTextContent('Count: 1');
        });

        store.dispatch(rerenderWidget({ name: 'TestWidget7' }));

        await waitFor(() => {
            expect(screen.getByTestId('view7')).toHaveTextContent('Count: 2');
        });
    });
});
