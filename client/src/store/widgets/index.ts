import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction, Reducer } from '@reduxjs/toolkit';

type WidgetsState = {
    rerenderVersions: Record<string, number>;
};

const initialState: WidgetsState = {
    rerenderVersions: {},
};

export const widgetsSlice = createSlice({
    name: 'widgets',
    initialState,
    reducers: {
        rerenderWidget: (state, action: PayloadAction<{ name: string }>) => {
            const { name } = action.payload;
            state.rerenderVersions[name] = (state.rerenderVersions[name] ?? 0) + 1;
        },
    },
});

export const { rerenderWidget } = widgetsSlice.actions;

export const reducer: Reducer<WidgetsState> = widgetsSlice.reducer;
