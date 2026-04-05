import { Router } from "express";
import { incomeExpenseReport } from "../controllers/report.controller";

export const reportRouter = Router();

// Example: GET /reports/income-expense?period=monthly&date=2026-04-03
reportRouter.get("/income-expense", incomeExpenseReport);

