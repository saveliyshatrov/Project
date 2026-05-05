import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import App from '../../src/App';
import { store } from '../../src/store';
import { registerWidget, clearWidgetRegistry } from '../../src/utils/global/registry';

describe('App', () => {
    beforeEach(() => {
        clearWidgetRegistry();
    });

    const renderWithProviders = (ui: React.ReactElement, initialEntries?: string[]) => {
        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries || ['/']}>{ui}</MemoryRouter>
            </Provider>
        );
    };

    it('renders 404 for unknown routes', () => {
        registerWidget('UserListWidget', {
            component: () => <div>User List</div>,
        });
        registerWidget('UserDetailWidget', {
            component: () => <div>User Detail</div>,
        });

        renderWithProviders(<App />, ['/unknown-path']);
        expect(screen.getByText('Wow, you found 404')).toBeInTheDocument();
    });

    it('renders UserListWidget on root path', () => {
        registerWidget('UserListWidget', {
            component: () => <div data-testid="user-list">User List Widget</div>,
        });

        renderWithProviders(<App />);
        expect(screen.getByTestId('user-list')).toBeInTheDocument();
    });
});
