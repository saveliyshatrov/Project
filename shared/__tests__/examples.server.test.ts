import { NAME } from '../src/resolver/examples.server';

describe('examples.server', () => {
    it('exports SERVER_NAME', () => {
        expect(NAME).toBe('SERVER_NAME');
    });
});
