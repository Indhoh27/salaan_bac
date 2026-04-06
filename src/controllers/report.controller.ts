import type { Request, Response } from "express";
import { buildIncomeExpensePdfBuffer } from "../helpers/incomeExpensePdf";
import {
  asReportPeriod,
  computeIncomeExpenseReport,
} from "../helpers/incomeExpenseReportCompute";
import { parseReportDate } from "../helpers/dateRange";

export async function incomeExpenseReport(req: Request, res: Response) {
  const period = asReportPeriod(req.query["period"]);
  const date = parseReportDate(req.query["date"]);
  const payload = await computeIncomeExpenseReport(period, date);
  res.json(payload);
}

/** Authenticated: download PDF for the selected period. */
export async function incomeExpenseReportPdf(req: Request, res: Response) {
  const period = asReportPeriod(req.query["period"]);
  const date = parseReportDate(req.query["date"]);
  const payload = await computeIncomeExpenseReport(period, date);
  const pdf = await buildIncomeExpensePdfBuffer(payload);
  const safePeriod = String(period).replace(/[^a-z]/gi, "_");
  res.setHeader("Content-Type", "application/pdf");
  const dateSlug = typeof req.query["date"] === "string" ? req.query["date"] : "export";
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="salaan-report-${safePeriod}-${dateSlug}.pdf"`,
  );
  res.send(pdf);
}
