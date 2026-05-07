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
        expect(state).toHaveProperty('widgets');
    });

    it('has widget state', () => {
        const state = store.getState();
        expect(state).toHaveProperty('widget');
        expect(state).toEqual({
            collections: {},
            widgets: {
                rerenderVersions: {},
            },
            widget: {},
        });
    });
});
