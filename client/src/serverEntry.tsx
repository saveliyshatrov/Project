import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer } from '@store/collections';
import { reducer as WidgetReducer } from '@store/widget';
import { reducer as WidgetsReducer } from '@store/widgets';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';

import App from './App';
import { registerWidget } from './utils/global/widget/registry';
import { resetInstanceCounter } from './utils/global/widget/Slot';
import NotFoundWidget from './widget/NotFound/widget';
import UserDetailWidget from './widget/UserDetail/widget';
import UserListWidget from './widget/UserList/widget';

registerWidget('UserListWidget', { component: UserListWidget as React.ComponentType<Record<string, unknown>> });
registerWidget('UserDetailWidget', { component: UserDetailWidget as React.ComponentType<Record<string, unknown>> });
registerWidget('NotFoundWidget', { component: NotFoundWidget as React.ComponentType<Record<string, unknown>> });

export function render(url: string): { html: string; state: Record<string, unknown> } {
    resetInstanceCounter();
    const store = configureStore({
        reducer: {
            collections: CollectionsReducer,
            widget: WidgetReducer,
            widgets: WidgetsReducer,
        },
    });

    const html = renderToString(
        <Provider store={store}>
            <StaticRouter location={url}>
                <App />
            </StaticRouter>
        </Provider>
    );

    return {
        html,
        state: store.getState() as Record<string, unknown>,
    };
}
