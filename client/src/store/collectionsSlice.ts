import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';

export type CollectionState = {
    [key: string]: Record<string, unknown>;
};

type WidgetState = {
    rerenderVersions: Record<string, number>;
};

type AppState = {
    collections: CollectionState;
    widgets: WidgetState;
};

const initialState: AppState = {
    collections: {},
    widgets: {
        rerenderVersions: {},
    },
};

export const collectionsSlice = createSlice({
    name: 'collections',
    initialState,
    reducers: {
        updateCollection: (state, action: PayloadAction<CollectionState>) => {
            const newCollectionsNames = Object.keys(action.payload);
            newCollectionsNames.forEach((collectionName) => {
                state.collections[collectionName] = state.collections[collectionName]
                    ? {
                          ...state.collections[collectionName],
                          ...action.payload[collectionName],
                      }
                    : action.payload[collectionName];
            });
        },
        rerenderWidget: (state, action: PayloadAction<{ name: string }>) => {
            const { name } = action.payload;
            state.widgets.rerenderVersions[name] = (state.widgets.rerenderVersions[name] ?? 0) + 1;
        },
    },
});

export const { updateCollection, rerenderWidget } = collectionsSlice.actions;

export const reducer: Reducer<AppState> = collectionsSlice.reducer;
