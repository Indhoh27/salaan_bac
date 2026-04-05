"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeExpenseReport = incomeExpenseReport;
const prisma_1 = require("../prisma");
const dateRange_1 = require("../helpers/dateRange");
const money_1 = require("../helpers/money");
function asPeriod(v) {
    if (v === "daily" || v === "weekly" || v === "monthly" || v === "yearly")
        return v;
    return "daily";
}
function toYmd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
async function incomeExpenseReport(req, res) {
    const period = asPeriod(req.query["period"]);
    const date = (0, dateRange_1.parseReportDate)(req.query["date"]);
    const { start, endExclusive } = (0, dateRange_1.getPeriodRange)(date, period);
    const [sellings, jobs, purchasePayments, expenses] = await Promise.all([
        prisma_1.prisma.selling.findMany({
            where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
            select: { price: true, discount: true, createdAt: true },
        }),
        prisma_1.prisma.job.findMany({
            where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
            select: { price: true, createdAt: true, payment_status: true },
        }),
        prisma_1.prisma.purchasePayment.findMany({
            where: { recyclePin: false, paid_at: { gte: start, lt: endExclusive } },
            select: { amount: true, paid_at: true },
        }),
        prisma_1.prisma.expense.findMany({
            where: { recyclePin: false, createdAt: { gte: start, lt: endExclusive } },
            select: { amount: true, createdAt: true },
        }),
    ]);
    // Income
    const sellingIncome = sellings.reduce((sum, s) => sum + ((0, money_1.parseMoney)(s.price) - (0, money_1.parseMoney)(s.discount)), 0);
    const jobIncome = jobs.reduce((sum, j) => sum + (0, money_1.parseMoney)(j.price), 0);
    const income = sellingIncome + jobIncome;
    // Expenses
    const purchaseExpense = purchasePayments.reduce((sum, p) => sum + (0, money_1.parseMoney)(p.amount), 0);
    const otherExpense = expenses.reduce((sum, e) => sum + (0, money_1.parseMoney)(e.amount), 0);
    const totalExpense = purchaseExpense + otherExpense;
    // Daily breakdown inside the selected period
    const byDay = {};
    for (const s of sellings) {
        const key = toYmd(s.createdAt);
        byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
        byDay[key].incomeSelling += (0, money_1.parseMoney)(s.price) - (0, money_1.parseMoney)(s.discount);
    }
    for (const j of jobs) {
        const key = toYmd(j.createdAt);
        byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
        byDay[key].incomeJobs += (0, money_1.parseMoney)(j.price);
    }
    for (const p of purchasePayments) {
        const key = toYmd(p.paid_at);
        byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
        byDay[key].expensePurchases += (0, money_1.parseMoney)(p.amount);
    }
    for (const e of expenses) {
        const key = toYmd(e.createdAt);
        byDay[key] ??= { incomeSelling: 0, incomeJobs: 0, expensePurchases: 0, expenseOther: 0 };
        byDay[key].expenseOther += (0, money_1.parseMoney)(e.amount);
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
//# sourceMappingURL=report.controller.js.map