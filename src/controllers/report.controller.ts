import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { getPeriodRange, parseReportDate, type ReportPeriod } from "../helpers/dateRange";
import { parseMoney } from "../helpers/money";

function asPeriod(v: unknown): ReportPeriod {
  if (v === "daily" || v === "weekly" || v === "monthly" || v === "yearly") return v;
  return "daily";
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function incomeExpenseReport(req: Request, res: Response) {
  const period = asPeriod(req.query["period"]);
  const date = parseReportDate(req.query["date"]);
  const { start, endExclusive } = getPeriodRange(date, period);

  const [sellings, jobs, purchasePayments, expenses] = await Promise.all([
    prisma.selling.findMany({
      where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
      select: { price: true, discount: true, createdAt: true },
    }),
    prisma.job.findMany({
      where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
      select: { price: true, createdAt: true, payment_status: true },
    }),
    prisma.purchasePayment.findMany({
      where: { recyclePin: false, paid_at: { gte: start, lt: endExclusive } },
      select: { amount: true, paid_at: true },
    }),
    prisma.expense.findMany({
      where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  // Income
  const sellingIncome = sellings.reduce((sum, s) => sum + (parseMoney(s.price) - parseMoney(s.discount)), 0);
  const jobIncome = jobs.reduce((sum, j) => sum + parseMoney(j.price), 0);
  const income = sellingIncome + jobIncome;

  // Expenses
  const purchaseExpense = purchasePayments.reduce((sum, p) => sum + parseMoney(p.amount), 0);
  const otherExpense = expenses.reduce((sum, e) => sum + parseMoney(e.amount), 0);
  const totalExpense = purchaseExpense + otherExpense;

  // Daily breakdown inside the selected period
  const byDay: Record<
    string,
    { incomeSelling: number; incomeJobs: number; expensePurchases: number; expenseOther: number }
  > = {};

  for (const s of sellings) {
    const key = toYmd(s.createdAt);
    byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
    byDay[key].incomeSelling += parseMoney(s.price) - parseMoney(s.discount);
  }
  for (const j of jobs) {
    const key = toYmd(j.createdAt);
    byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
    byDay[key].incomeJobs += parseMoney(j.price);
  }
  for (const p of purchasePayments) {
    const key = toYmd(p.paid_at);
    byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
    byDay[key].expensePurchases += parseMoney(p.amount);
  }
  for (const e of expenses) {
    const key = toYmd(e.createdAt);
    byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
    byDay[key].expenseOther += parseMoney(e.amount);
  }

  const breakdown = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, v]) => {
      const dayIncome = v.incomeSelling + v.incomeJobs;
      const dayExpense = v.expensePurchases + v.expenseOther;
      return {
        day,
        income: dayIncome,
        expense: dayExpense,
        profit: dayIncome - dayExpense,
        incomeSelling: v.incomeSelling,
        incomeJobs: v.incomeJobs,
        expensePurchases: v.expensePurchases,
        expenseOther: v.expenseOther,
      };
    });

  res.json({
    period,
    start: start.toISOString(),
    endExclusive: endExclusive.toISOString(),
    income,
    expenses: totalExpense,
    profit: income - totalExpense,
    incomeBreakdown: { sellings: sellingIncome, jobs: jobIncome },
    expenseBreakdown: { purchasePayments: purchaseExpense, otherExpenses: otherExpense },
    breakdown,
  });
}

