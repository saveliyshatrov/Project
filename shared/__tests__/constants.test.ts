import { formatUser, VERSION, AUTHOR } from '../src/index';
import type { User } from '../src/index';

describe('formatUser', () => {
    it('formats user with name, email and id', () => {
        const user: User = { id: '1', name: 'John', email: 'john@example.com' };
        expect(formatUser(user)).toBe('John <john@example.com> (ID: 1)');
    });

    it('handles special characters in name', () => {
        const user: User = { id: '2', name: "O'Brien", email: 'obrien@test.com' };
        expect(formatUser(user)).toBe("O'Brien <obrien@test.com> (ID: 2)");
    });
});

describe('VERSION', () => {
    it('is a non-empty string', () => {
        expect(typeof VERSION).toBe('string');
        expect(VERSION.length).toBeGreaterThan(0);
    });

    it('has semantic version format', () => {
        expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});

describe('AUTHOR', () => {
    it('is a non-empty string', () => {
        expect(typeof AUTHOR).toBe('string');
        expect(AUTHOR.length).toBeGreaterThan(0);
    });
});
