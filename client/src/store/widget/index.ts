import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';

export type WidgetData = Record<string, unknown>;

export type WidgetSliceState = Record<string, WidgetData>;

const initialState: WidgetSliceState = {};

export const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        updateWidgetData: (state, action: PayloadAction<{ id: string; data: WidgetData }>) => {
            const { id, data } = action.payload;
            state[id] = state[id] ? { ...state[id], ...data } : data;
        },
        clearWidgetData: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
    },
});

export const { updateWidgetData, clearWidgetData } = widgetSlice.actions;

export const reducer: Reducer<WidgetSliceState> = widgetSlice.reducer;
