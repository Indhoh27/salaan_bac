import type { CookieOptions, Response } from "express";

export const ACCESS_COOKIE = "salaan_access";
export const REFRESH_COOKIE = "salaan_refresh";

/** Aligns with default JWT access lifetime (15m). */
const ACCESS_MAX_MS = 15 * 60 * 1000;
/** Aligns with default JWT refresh lifetime (30d). */
const REFRESH_MAX_MS = 30 * 24 * 60 * 60 * 1000;

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  const secure =
    process.env["COOKIE_SECURE"] === "1" || process.env["NODE_ENV"] === "production";
  const raw = process.env["COOKIE_SAME_SITE"]?.toLowerCase();
  const sameSite: CookieOptions["sameSite"] =
    raw === "none" || raw === "strict" || raw === "lax" ? raw : "lax";

  return {
    httpOnly: true,
    secure: sameSite === "none" ? true : secure,
    sameSite,
    path: "/",
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, baseCookieOptions(ACCESS_MAX_MS));
  res.cookie(REFRESH_COOKIE, refreshToken, baseCookieOptions(REFRESH_MAX_MS));
}

export function clearAuthCookies(res: Response): void {
  const p = { path: "/" };
  res.clearCookie(ACCESS_COOKIE, p);
  res.clearCookie(REFRESH_COOKIE, p);
}
