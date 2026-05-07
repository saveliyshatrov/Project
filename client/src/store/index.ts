import type { EnhancedStore } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import { reducer as CollectionsReducer } from './collectionsSlice';
import { reducer as WidgetReducer } from './widgetSlice';

type Store = EnhancedStore<{
    collections: ReturnType<typeof CollectionsReducer>;
    widget: ReturnType<typeof WidgetReducer>;
}>;

export const store: Store = configureStore({
    reducer: {
        collections: CollectionsReducer,
        widget: WidgetReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
