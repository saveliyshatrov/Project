import type { EnhancedStore } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import { reducer as WidgetsReducer } from '@store/widgets';

import { reducer as CollectionsReducer } from './collections';
import { reducer as WidgetReducer } from './widget';

type Store = EnhancedStore<{
    collections: ReturnType<typeof CollectionsReducer>;
    widget: ReturnType<typeof WidgetReducer>;
    widgets: ReturnType<typeof WidgetsReducer>;
}>;

export const store: Store = configureStore({
    reducer: {
        collections: CollectionsReducer,
        widget: WidgetReducer,
        widgets: WidgetsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
