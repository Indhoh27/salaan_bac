import type { Response } from "express";
export declare const ACCESS_COOKIE = "salaan_access";
export declare const REFRESH_COOKIE = "salaan_refresh";
export declare function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void;
export declare function clearAuthCookies(res: Response): void;
//# sourceMappingURL=authCookies.d.ts.map