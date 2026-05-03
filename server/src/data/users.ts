import { User } from 'shared';
import { NAME } from 'shared/resolver/examples';

export const users: User[] = [
    { id: '1', name: NAME, email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
];
