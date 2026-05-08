import type { EnhancedStore, Reducer } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as CollectionsReducer } from '@store/collections';
import { reducer as WidgetReducer } from '@store/widget';
import { reducer as WidgetsReducer } from '@store/widgets';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

declare global {
    interface Window {
        __INITIAL_STATE__?: Record<string, unknown>;
    }
}

type StoreState = {
    collections: ReturnType<typeof CollectionsReducer>;
    widget: ReturnType<typeof WidgetReducer>;
    widgets: ReturnType<typeof WidgetsReducer>;
};

const reducers = {
    collections: CollectionsReducer as Reducer<StoreState['collections']>,
    widget: WidgetReducer as Reducer<StoreState['widget']>,
    widgets: WidgetsReducer as Reducer<StoreState['widgets']>,
};

const rootElement = document.getElementById('root') as HTMLElement;
const hasServerHtml = rootElement && rootElement.innerHTML.trim().length > 0;
const initialSsrState = hasServerHtml ? (window.__INITIAL_STATE__ as unknown as StoreState) : undefined;

const store: EnhancedStore<StoreState> = configureStore({
    reducer: reducers,
    preloadedState: initialSsrState,
});

if (hasServerHtml) {
    ReactDOM.hydrateRoot(
        rootElement,
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
} else {
    ReactDOM.createRoot(rootElement).render(
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
}
