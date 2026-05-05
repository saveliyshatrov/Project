import { store } from '../../src/store';

describe('store', () => {
    it('exports configured store', () => {
        expect(store).toBeDefined();
        expect(store.getState).toBeDefined();
        expect(store.dispatch).toBeDefined();
    });

    it('has collections state', () => {
        const state = store.getState();
        expect(state).toHaveProperty('collections');
        expect(state.collections).toHaveProperty('widgets');
    });
});
