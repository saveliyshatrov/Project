import { CLIENT } from '../../src/config';

describe('config', () => {
    it('exports CLIENT', () => {
        expect(CLIENT).toBe(process.env.CLIENT);
    });
});
