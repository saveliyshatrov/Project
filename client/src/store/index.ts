import { configureStore } from '@reduxjs/toolkit';

import { reducer as CollectionsReducer } from './collectionsSlice';

export const store = configureStore({
    reducer: {
        collections: CollectionsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
