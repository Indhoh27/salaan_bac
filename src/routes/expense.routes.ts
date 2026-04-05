import { Router } from "express";
import { createExpense, deleteExpense, getExpenseById, listExpenses, updateExpense } from "../controllers/expense.controller";

export const expenseRouter = Router();

expenseRouter.get("/", listExpenses);
expenseRouter.get("/:id", getExpenseById);
expenseRouter.post("/", createExpense);
expenseRouter.put("/:id", updateExpense);
expenseRouter.delete("/:id", deleteExpense);

