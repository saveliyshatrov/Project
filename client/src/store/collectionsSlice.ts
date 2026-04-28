import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type CollectionState = {
    [key: string]: Record<string, any>
}

const initialState: CollectionState = {}

export const collectionsSlice = createSlice({
    name: 'collections',
    initialState,
    reducers: {
        updateCollection: (state, action: PayloadAction<CollectionState>) => {
            const newCollectionsNames = Object.keys(action.payload);
            newCollectionsNames.forEach(collectionName => {
                state[collectionName] = state[collectionName] ? {
                    ...state[collectionName],
                    ...action.payload[collectionName],
                } : action.payload[collectionName];
            });
        },
    },
});

export const { updateCollection } = collectionsSlice.actions;

export const { reducer } = collectionsSlice;