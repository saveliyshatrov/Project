import { reducer, updateWidgetData, clearWidgetData } from '../../src/store/widget';

describe('widgetSlice', () => {
    it('returns initial state', () => {
        const state = reducer(undefined, { type: 'unknown' });
        expect(state).toEqual({});
    });

    it('handles updateWidgetData', () => {
        const state = reducer({}, updateWidgetData({ id: '*Widget-Test-1', data: { users: [{ id: '1' }] } }));
        expect(state['*Widget-Test-1']).toEqual({ users: [{ id: '1' }] });
    });

    it('overwrites existing widget data', () => {
        const state = reducer(
            { '*Widget-Test-1': { users: [{ id: '1' }] } },
            updateWidgetData({ id: '*Widget-Test-1', data: { users: [{ id: '2' }] } })
        );
        expect(state['*Widget-Test-1']).toEqual({ users: [{ id: '2' }] });
    });

    it('stores multiple widgets independently', () => {
        const state = reducer(
            { '*Widget-A-1': { value: 'a' } },
            updateWidgetData({ id: '*Widget-B-2', data: { value: 'b' } })
        );
        expect(state['*Widget-A-1']).toEqual({ value: 'a' });
        expect(state['*Widget-B-2']).toEqual({ value: 'b' });
    });

    it('handles clearWidgetData', () => {
        const state = reducer({ '*Widget-Test-1': { data: 'something' } }, clearWidgetData('*Widget-Test-1'));
        expect(state['*Widget-Test-1']).toBeUndefined();
    });
});
