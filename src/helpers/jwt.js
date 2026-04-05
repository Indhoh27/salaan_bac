"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = require("jsonwebtoken");
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`${name} is not set`);
    return v;
}
const ACCESS_SECRET = () => requireEnv("JWT_ACCESS_SECRET");
const REFRESH_SECRET = () => requireEnv("JWT_REFRESH_SECRET");
const ACCESS_EXPIRES_IN = () => (process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m");
const REFRESH_EXPIRES_IN = () => (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d");
function signAccessToken(payload) {
    return (0, jsonwebtoken_1.sign)(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRES_IN() });
}
function signRefreshToken(payload) {
    return (0, jsonwebtoken_1.sign)(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES_IN() });
}
function verifyAccessToken(token) {
    return (0, jsonwebtoken_1.verify)(token, ACCESS_SECRET());
}
function verifyRefreshToken(token) {
    return (0, jsonwebtoken_1.verify)(token, REFRESH_SECRET());
}
//# sourceMappingURL=jwt.js.map