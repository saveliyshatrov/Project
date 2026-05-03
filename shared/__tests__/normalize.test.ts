import { normalize } from '../src/resolver/normalize';

describe('normalize', () => {
    const getId = (item: { id: string }) => item.id;
    const getName = (item: { name: string }) => item.name;

    it('creates a collection from a list', () => {
        const items = [
            { id: '1', name: 'A' },
            { id: '2', name: 'B' },
        ];

        const result = normalize(getId)(items, 'items');

        expect(result).toEqual({
            items: {
                '1': { id: '1', name: 'A' },
                '2': { id: '2', name: 'B' },
            },
        });
    });

    it('handles empty list', () => {
        const result = normalize(getId)([], 'items');
        expect(result).toEqual({ items: {} });
    });

    it('uses custom key function', () => {
        const items = [
            { id: '1', name: 'Alice' },
            { id: '2', name: 'Bob' },
        ];

        const result = normalize(getName)(items, 'users');

        expect(result).toEqual({
            users: {
                Alice: { id: '1', name: 'Alice' },
                Bob: { id: '2', name: 'Bob' },
            },
        });
    });

    it('overwrites entries with same key', () => {
        const items = [
            { id: '1', name: 'Old' },
            { id: '1', name: 'New' },
        ];

        const result = normalize(getId)(items, 'items');

        expect(result.items['1']).toEqual({ id: '1', name: 'New' });
    });

    it('returns correct collection state type', () => {
        const items = [{ id: '1' }];
        const result = normalize((i: { id: string }) => i.id)(items, 'data');
        expect(result.data).toBeInstanceOf(Object);
        expect(typeof result.data['1']).toBe('object');
    });
});
