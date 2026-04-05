"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAccessToken = void 0;
const authCookies_1 = require("../helpers/authCookies");
const jwt_1 = require("../helpers/jwt");
function extractAccessToken(req) {
    const auth = req.headers.authorization;
    if (typeof auth === "string" && auth.startsWith("Bearer ")) {
        const t = auth.slice(7).trim();
        if (t)
            return t;
    }
    const c = req.cookies?.[authCookies_1.ACCESS_COOKIE];
    return typeof c === "string" && c ? c : "";
}
const requireAccessToken = (req, res, next) => {
    const token = extractAccessToken(req);
    if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        req.user = (0, jwt_1.verifyAccessToken)(token);
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.requireAccessToken = requireAccessToken;
const requireAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== "ADMIN") {
        res.status(403).json({ message: "Admin only" });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.middleware.js.map