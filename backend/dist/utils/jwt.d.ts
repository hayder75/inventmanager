export interface TokenPayload {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'SALES';
}
export declare function generateToken(payload: TokenPayload): string;
export declare function verifyToken(token: string): TokenPayload;
//# sourceMappingURL=jwt.d.ts.map