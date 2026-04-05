"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportRouter = void 0;
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
exports.reportRouter = (0, express_1.Router)();
// Example: GET /reports/income-expense?period=monthly&date=2026-04-03
exports.reportRouter.get("/income-expense", report_controller_1.incomeExpenseReport);
//# sourceMappingURL=report.routes.js.map