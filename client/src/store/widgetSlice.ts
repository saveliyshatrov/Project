import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';

type WidgetSliceState = Record<string, Record<string, unknown>>;

const initialState: WidgetSliceState = {};

export const widgetSlice = createSlice({
    name: 'widget',
    initialState,
    reducers: {
        updateWidgetData: (state, action: PayloadAction<{ id: string; data: Record<string, unknown> }>) => {
            const { id, data } = action.payload;
            state[id] = state[id]
                ? {
                      ...state[id],
                      data,
                  }
                : data;
        },
        clearWidgetData: (state, action: PayloadAction<string>) => {
            delete state[action.payload];
        },
    },
});

export const { updateWidgetData, clearWidgetData } = widgetSlice.actions;

export const reducer: Reducer<WidgetSliceState> = widgetSlice.reducer;
