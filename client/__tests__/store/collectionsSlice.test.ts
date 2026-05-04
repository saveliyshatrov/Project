import { reducer, rerenderWidget, updateCollection } from '../../src/store/collectionsSlice';

describe('collectionsSlice', () => {
    describe('updateCollection', () => {
        it('adds a new collection to empty state', () => {
            const state = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            expect(state.collections).toHaveProperty('users');
            expect(state.collections.users['1']).toEqual({ id: '1', name: 'John' });
        });

        it('merges into existing collection', () => {
            const prevState = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            const newState = reducer(prevState, updateCollection({ users: { '2': { id: '2', name: 'Jane' } } }));
            expect(newState.collections.users['1']).toEqual({ id: '1', name: 'John' });
            expect(newState.collections.users['2']).toEqual({ id: '2', name: 'Jane' });
        });

        it('overwrites entries with same key', () => {
            const prevState = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            const newState = reducer(prevState, updateCollection({ users: { '1': { id: '1', name: 'Updated' } } }));
            expect(newState.collections.users['1']).toEqual({ id: '1', name: 'Updated' });
        });

        it('handles multiple collections at once', () => {
            const state = reducer(
                undefined,
                updateCollection({
                    users: { '1': { id: '1' } },
                    posts: { '10': { id: '10', title: 'Hello' } },
                })
            );
            expect(state.collections).toHaveProperty('users');
            expect(state.collections).toHaveProperty('posts');
            expect(state.collections.users['1']).toEqual({ id: '1' });
            expect(state.collections.posts['10']).toEqual({ id: '10', title: 'Hello' });
        });

        it('returns initial state for empty payload', () => {
            const state = reducer(undefined, updateCollection({}));
            expect(state.collections).toEqual({});
        });
    });

    describe('rerenderWidget', () => {
        it('increments rerenderVersion for a widget', () => {
            const state = reducer(undefined, rerenderWidget({ name: 'TestWidget' }));
            expect(state.widgets.rerenderVersions['TestWidget']).toBe(1);
        });

        it('increments version on subsequent calls', () => {
            let state = reducer(undefined, rerenderWidget({ name: 'TestWidget' }));
            state = reducer(state, rerenderWidget({ name: 'TestWidget' }));
            expect(state.widgets.rerenderVersions['TestWidget']).toBe(2);
        });

        it('tracks different widgets independently', () => {
            let state = reducer(undefined, rerenderWidget({ name: 'WidgetA' }));
            state = reducer(state, rerenderWidget({ name: 'WidgetB' }));
            expect(state.widgets.rerenderVersions['WidgetA']).toBe(1);
            expect(state.widgets.rerenderVersions['WidgetB']).toBe(1);
        });
    });
});
