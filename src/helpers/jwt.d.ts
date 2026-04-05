export type JwtUserPayload = {
    sub: string;
    role: "ADMIN" | "STAFF";
};
export declare function signAccessToken(payload: JwtUserPayload): string;
export declare function signRefreshToken(payload: JwtUserPayload): string;
export declare function verifyAccessToken(token: string): JwtUserPayload;
export declare function verifyRefreshToken(token: string): JwtUserPayload;
//# sourceMappingURL=jwt.d.ts.map