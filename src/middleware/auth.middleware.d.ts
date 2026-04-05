import type { Request, RequestHandler } from "express";
import { type JwtUserPayload } from "../helpers/jwt";
export type AuthedRequest = Request & {
    user: JwtUserPayload;
};
export declare const requireAccessToken: RequestHandler;
export declare const requireAdmin: RequestHandler;
//# sourceMappingURL=auth.middleware.d.ts.map