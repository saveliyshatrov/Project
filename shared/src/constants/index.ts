export const AUTHOR = 'SAV';

export interface User {
    id: string;
    name: string;
    email: string;
}

export function formatUser(user: User): string {
    return `${user.name} <${user.email}> (ID: ${user.id})`;
}

export const VERSION = '1.0.0';
