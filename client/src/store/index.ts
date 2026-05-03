import type { EnhancedStore } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';

import { reducer as CollectionsReducer } from './collectionsSlice';

type Store = EnhancedStore<{
    collections: ReturnType<typeof CollectionsReducer>;
}>;

export const store: Store = configureStore({
    reducer: {
        collections: CollectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
