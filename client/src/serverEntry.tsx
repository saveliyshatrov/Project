import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer, updateCollection } from '@store/collections';
import { reducer as WidgetReducer, updateWidgetData } from '@store/widget';
import { reducer as WidgetsReducer } from '@store/widgets';
import { routeRegistry } from '@utils/global/routes';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { matchPath, StaticRouter } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolverRegistry } = require('shared/resolver') as {
    resolverRegistry: Map<
        string,
        { func: (ctx: Record<string, unknown>, params: Record<string, unknown>) => Promise<Record<string, unknown>> }
    >;
};

import App from './App';
import { registerWidget } from './utils/global/widget/registry';
import { resetInstanceCounter } from './utils/global/widget/Slot';
import NotFoundWidget from './widget/NotFound/widget';
import UserDetailWidget from './widget/UserDetail/widget';
import UserListWidget from './widget/UserList/widget';

registerWidget('UserListWidget', { component: UserListWidget as React.ComponentType<Record<string, unknown>> });
registerWidget('UserDetailWidget', { component: UserDetailWidget as React.ComponentType<Record<string, unknown>> });
registerWidget('NotFoundWidget', { component: NotFoundWidget as React.ComponentType<Record<string, unknown>> });

export async function render(url: string): Promise<{ html: string; state: Record<string, unknown> }> {
    resetInstanceCounter();
    const store = configureStore({
        reducer: {
            collections: CollectionsReducer,
            widget: WidgetReducer,
            widgets: WidgetsReducer,
        },
    });

    for (const route of routeRegistry) {
        const match = matchPath(route.path, url);
        if (!match) continue;

        const predictedWidgetId = `*Widget-${route.widgetName}-1`;

        if (route.widgetName === 'UserListWidget') {
            const entry = resolverRegistry.get('resolveUsers');
            if (entry) {
                const userCollection = (await entry.func({ isServer: true }, { limit: 10 })) as {
                    users: Record<string, { id: string; name: string; email: string }>;
                };
                const users = Object.values(userCollection.users);
                store.dispatch(updateWidgetData({ id: predictedWidgetId, data: { users } as Record<string, unknown> }));
                store.dispatch(updateCollection({ userCollection }));
            }
        } else if (route.widgetName === 'UserDetailWidget') {
            const userId = (match.params as Record<string, string | undefined>).userId;
            if (userId) {
                const entry = resolverRegistry.get('resolveUser');
                if (entry) {
                    const userCollection = (await entry.func({ isServer: true }, { id: userId })) as {
                        users: Record<string, { id: string; name: string; email: string }>;
                    };
                    const user = userCollection.users[userId];
                    if (user) {
                        store.dispatch(
                            updateWidgetData({ id: predictedWidgetId, data: { user } as Record<string, unknown> })
                        );
                    }
                }
            }
        }

        break;
    }

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
