"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.me = me;
exports.refresh = refresh;
exports.logout = logout;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const prisma_1 = require("../prisma");
const authCookies_1 = require("../helpers/authCookies");
const jwt_1 = require("../helpers/jwt");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function tokenExpToDate(token) {
    const decoded = (0, jsonwebtoken_1.decode)(token);
    if (!decoded?.exp)
        return null;
    return new Date(decoded.exp * 1000);
}
function userJson(user) {
    return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}
async function login(req, res) {
    const email = asString(req.body?.email);
    const password = asString(req.body?.password);
    if (!email || !password)
        return res.status(400).json({ message: "email and password are required" });
    const user = await prisma_1.prisma.user.findFirst({
        where: { email, recyclePin: false },
        select: { id: true, email: true, passwordHash: true, fullName: true, role: true },
    });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const payload = { sub: user.id, role: user.role };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    const accessTokenExpires = tokenExpToDate(accessToken);
    const refreshTokenExpires = tokenExpToDate(refreshToken);
    await prisma_1.prisma.user.update({
        where: { id: user.id },
        data: {
            accessToken,
            accessTokenExpires: accessTokenExpires ?? null,
            refreshToken,
            refreshTokenExpires: refreshTokenExpires ?? null,
        },
    });
    (0, authCookies_1.setAuthCookies)(res, accessToken, refreshToken);
    return res.json({
        user: userJson({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }),
    });
}
async function me(req, res) {
    const fromHeader = typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.slice(7).trim()
        : "";
    const raw = fromHeader || req.cookies?.[authCookies_1.ACCESS_COOKIE];
    if (!raw)
        return res.status(401).json({ message: "Unauthorized" });
    let payload;
    try {
        payload = (0, jwt_1.verifyAccessToken)(raw);
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await prisma_1.prisma.user.findFirst({
        where: { id: payload.sub, recyclePin: false },
        select: { id: true, email: true, fullName: true, role: true },
    });
    if (!user)
        return res.status(401).json({ message: "Unauthorized" });
    return res.json({ user: userJson(user) });
}
async function refresh(req, res) {
    const refreshToken = req.cookies?.[authCookies_1.REFRESH_COOKIE];
    if (!refreshToken) {
        (0, authCookies_1.clearAuthCookies)(res);
        return res.status(401).json({ message: "No refresh token" });
    }
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        (0, authCookies_1.clearAuthCookies)(res);
        return res.status(401).json({ message: "Invalid refresh token" });
    }
    const row = await prisma_1.prisma.user.findFirst({
        where: { id: payload.sub, recyclePin: false, refreshToken },
        select: { id: true, email: true, fullName: true, role: true },
    });
    if (!row) {
        (0, authCookies_1.clearAuthCookies)(res);
        return res.status(401).json({ message: "Session expired" });
    }
    const nextPayload = { sub: row.id, role: row.role };
    const accessToken = (0, jwt_1.signAccessToken)(nextPayload);
    const nextRefresh = (0, jwt_1.signRefreshToken)(nextPayload);
    const accessTokenExpires = tokenExpToDate(accessToken);
    const refreshTokenExpires = tokenExpToDate(nextRefresh);
    await prisma_1.prisma.user.update({
        where: { id: row.id },
        data: {
            accessToken,
            accessTokenExpires: accessTokenExpires ?? null,
            refreshToken: nextRefresh,
            refreshTokenExpires: refreshTokenExpires ?? null,
        },
    });
    (0, authCookies_1.setAuthCookies)(res, accessToken, nextRefresh);
    return res.json({ user: userJson(row) });
}
async function logout(req, res) {
    const access = req.cookies?.[authCookies_1.ACCESS_COOKIE];
    try {
        if (access) {
            const { sub } = (0, jwt_1.verifyAccessToken)(access);
            await prisma_1.prisma.user.update({
                where: { id: sub },
                data: {
                    accessToken: null,
                    accessTokenExpires: null,
                    refreshToken: null,
                    refreshTokenExpires: null,
                },
            });
        }
    }
    catch {
        /* ignore invalid access token */
    }
    (0, authCookies_1.clearAuthCookies)(res);
    return res.status(204).send();
}
//# sourceMappingURL=auth.controller.js.map