import type { Request, RequestHandler, Response } from "express";
import { ACCESS_COOKIE } from "../helpers/authCookies";
import { verifyAccessToken, type JwtUserPayload } from "../helpers/jwt";

export type AuthedRequest = Request & { user: JwtUserPayload };

function extractAccessToken(req: Request): string {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    if (t) return t;
  }
  const c = req.cookies?.[ACCESS_COOKIE];
  return typeof c === "string" && c ? c : "";
}

export const requireAccessToken: RequestHandler = (req: Request, res: Response, next) => {
  const token = extractAccessToken(req);
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    (req as AuthedRequest).user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin: RequestHandler = (req: Request, res: Response, next) => {
  const user = (req as AuthedRequest).user;
  if (!user || user.role !== "ADMIN") {
    res.status(403).json({ message: "Admin only" });
    return;
  }
  next();
};
