"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMs = addMs;
exports.minutesToMs = minutesToMs;
exports.daysToMs = daysToMs;
function addMs(date, ms) {
    return new Date(date.getTime() + ms);
}
function minutesToMs(minutes) {
    return minutes * 60 * 1000;
}
function daysToMs(days) {
    return days * 24 * 60 * 60 * 1000;
}
//# sourceMappingURL=time.js.map