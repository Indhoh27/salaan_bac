"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRouter = void 0;
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
exports.expenseRouter = (0, express_1.Router)();
exports.expenseRouter.get("/", expense_controller_1.listExpenses);
exports.expenseRouter.get("/:id", expense_controller_1.getExpenseById);
exports.expenseRouter.post("/", expense_controller_1.createExpense);
exports.expenseRouter.put("/:id", expense_controller_1.updateExpense);
exports.expenseRouter.delete("/:id", expense_controller_1.deleteExpense);
//# sourceMappingURL=expense.routes.js.map