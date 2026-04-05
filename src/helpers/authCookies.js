"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_COOKIE = exports.ACCESS_COOKIE = void 0;
exports.setAuthCookies = setAuthCookies;
exports.clearAuthCookies = clearAuthCookies;
exports.ACCESS_COOKIE = "salaan_access";
exports.REFRESH_COOKIE = "salaan_refresh";
/** Aligns with default JWT access lifetime (15m). */
const ACCESS_MAX_MS = 15 * 60 * 1000;
/** Aligns with default JWT refresh lifetime (30d). */
const REFRESH_MAX_MS = 30 * 24 * 60 * 60 * 1000;
function baseCookieOptions(maxAgeMs) {
    const secure = process.env["COOKIE_SECURE"] === "1" || process.env["NODE_ENV"] === "production";
    const raw = process.env["COOKIE_SAME_SITE"]?.toLowerCase();
    const sameSite = raw === "none" || raw === "strict" || raw === "lax" ? raw : "lax";
    return {
        httpOnly: true,
        secure: sameSite === "none" ? true : secure,
        sameSite,
        path: "/",
        maxAge: maxAgeMs,
    };
}
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie(exports.ACCESS_COOKIE, accessToken, baseCookieOptions(ACCESS_MAX_MS));
    res.cookie(exports.REFRESH_COOKIE, refreshToken, baseCookieOptions(REFRESH_MAX_MS));
}
function clearAuthCookies(res) {
    const p = { path: "/" };
    res.clearCookie(exports.ACCESS_COOKIE, p);
    res.clearCookie(exports.REFRESH_COOKIE, p);
}
//# sourceMappingURL=authCookies.js.map