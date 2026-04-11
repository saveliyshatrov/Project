export interface User {
    id: string;
    name: string;
    email: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export declare function formatUser(user: User): string;
export declare const VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map