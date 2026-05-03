import { reducer, updateCollection } from '../../src/store/collectionsSlice';

describe('collectionsSlice', () => {
    describe('updateCollection', () => {
        it('adds a new collection to empty state', () => {
            const state = reducer(undefined, updateCollection({ users: { '1': { id: '1', name: 'John' } } }));
            expect(state).toHaveProperty('users');
            expect(state['1']).toBeUndefined();
            expect(state.users['1']).toEqual({ id: '1', name: 'John' });
        });

        it('merges into existing collection', () => {
            const prevState = {
                users: { '1': { id: '1', name: 'John' } },
            };
            const newState = reducer(prevState, updateCollection({ users: { '2': { id: '2', name: 'Jane' } } }));
            expect(newState.users['1']).toEqual({ id: '1', name: 'John' });
            expect(newState.users['2']).toEqual({ id: '2', name: 'Jane' });
        });

        it('overwrites entries with same key', () => {
            const prevState = {
                users: { '1': { id: '1', name: 'John' } },
            };
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
});
