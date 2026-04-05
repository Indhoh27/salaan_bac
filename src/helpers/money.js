"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMoney = parseMoney;
function parseMoney(value) {
    if (typeof value !== "string")
        return 0;
    const normalized = value.replace(/[^0-9.\-]/g, "");
    const n = Number.parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
}
//# sourceMappingURL=money.js.map