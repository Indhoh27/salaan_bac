import { Router } from "express";
import {
  incomeExpenseReport,
  incomeExpenseReportPdf,
} from "../controllers/report.controller";
import { requireAccessToken } from "../middleware/auth.middleware";

export const reportRouter = Router();

reportRouter.get("/income-expense", incomeExpenseReport);
reportRouter.get("/income-expense/pdf", requireAccessToken, incomeExpenseReportPdf);
