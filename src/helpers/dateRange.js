"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startOfDay = startOfDay;
exports.endOfDayExclusive = endOfDayExclusive;
exports.getPeriodRange = getPeriodRange;
exports.parseReportDate = parseReportDate;
function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDayExclusive(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
}
function startOfWeekMonday(d) {
    // JS: 0=Sun..6=Sat; we want Monday as start
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7; // Mon->0, Tue->1, ..., Sun->6
    return startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diffToMonday));
}
function getPeriodRange(date, period) {
    const d = new Date(date);
    if (period === "daily") {
        return { start: startOfDay(d), endExclusive: endOfDayExclusive(d) };
    }
    if (period === "weekly") {
        const start = startOfWeekMonday(d);
        const endExclusive = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
        return { start, endExclusive };
    }
    if (period === "monthly") {
        const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
        const endExclusive = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
        return { start, endExclusive };
    }
    const start = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
    const endExclusive = new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
    return { start, endExclusive };
}
function parseReportDate(input) {
    if (typeof input !== "string" || !input.trim())
        return new Date();
    // Accept YYYY-MM-DD or full ISO.
    const d = new Date(input);
    if (Number.isNaN(d.getTime()))
        return new Date();
    return d;
}
//# sourceMappingURL=dateRange.js.map