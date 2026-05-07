import { reducer, updateCollection } from '../../src/store/collections';
import { reducer as widgetsReducer, rerenderWidget } from '../../src/store/widgets';

describe('collectionsSlice', () => {
    describe('updateCollection', () => {
        it('adds a new collection to empty state', () => {
            const state = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            expect(state).toHaveProperty('users');
            expect(state.users['1']).toEqual({ id: '1', name: 'John' });
        });

        it('merges into existing collection', () => {
            const prevState = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            const newState = reducer(prevState, updateCollection({ users: { '2': { id: '2', name: 'Jane' } } }));
            expect(newState.users['1']).toEqual({ id: '1', name: 'John' });
            expect(newState.users['2']).toEqual({ id: '2', name: 'Jane' });
        });

        it('overwrites entries with same key', () => {
            const prevState = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            const newState = reducer(prevState, updateCollection({ users: { '1': { id: '1', name: 'Updated' } } }));
            expect(newState.users['1']).toEqual({ id: '1', name: 'Updated' });
        });

        it('handles multiple collections at once', () => {
            const state = reducer(
                undefined,
                updateCollection({
                    users: { '1': { id: '1' } },
                    posts: { '10': { id: '10', title: 'Hello' } },
                })
            );
            expect(state).toHaveProperty('users');
            expect(state).toHaveProperty('posts');
            expect(state.users['1']).toEqual({ id: '1' });
            expect(state.posts['10']).toEqual({ id: '10', title: 'Hello' });
        });

        it('returns initial state for empty payload', () => {
            const state = reducer(undefined, updateCollection({}));
            expect(state).toEqual({});
        });
    });

    describe('rerenderWidget', () => {
        it('increments rerenderVersion for a widget', () => {
            const state = widgetsReducer(undefined, rerenderWidget({ name: 'TestWidget' }));
            expect(state.rerenderVersions['TestWidget']).toBe(1);
        });

        it('increments version on subsequent calls', () => {
            let state = widgetsReducer(undefined, rerenderWidget({ name: 'TestWidget' }));
            state = widgetsReducer(state, rerenderWidget({ name: 'TestWidget' }));
            expect(state.rerenderVersions['TestWidget']).toBe(2);
        });

        it('tracks different widgets independently', () => {
            let state = widgetsReducer(undefined, rerenderWidget({ name: 'WidgetA' }));
            state = widgetsReducer(state, rerenderWidget({ name: 'WidgetB' }));
            expect(state.rerenderVersions['WidgetA']).toBe(1);
            expect(state.rerenderVersions['WidgetB']).toBe(1);
        });
    });
});
