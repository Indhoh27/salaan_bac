"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listExpenses = listExpenses;
exports.getExpenseById = getExpenseById;
exports.createExpense = createExpense;
exports.updateExpense = updateExpense;
exports.deleteExpense = deleteExpense;
const prisma_1 = require("../prisma");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
async function listExpenses(_req, res) {
    const expenses = await prisma_1.prisma.expense.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
    });
    res.json(expenses);
}
async function getExpenseById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const expense = await prisma_1.prisma.expense.findFirst({ where: { id, recyclePin: false } });
    if (!expense)
        return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
}
async function createExpense(req, res) {
    const description = asString(req.body?.description);
    const amount = asString(req.body?.amount);
    const user_id = asString(req.body?.user_id);
    if (!description || !amount || !user_id)
        return res.status(400).json({ message: "Missing required fields" });
    const expense = await prisma_1.prisma.expense.create({ data: { description, amount, user_id } });
    res.status(201).json(expense);
}
async function updateExpense(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.expense.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Expense not found" });
    const data = {};
    const description = asString(req.body?.description);
    const amount = asString(req.body?.amount);
    const user_id = asString(req.body?.user_id);
    if (description)
        data.description = description;
    if (amount)
        data.amount = amount;
    if (user_id)
        data.user_id = user_id;
    const expense = await prisma_1.prisma.expense.update({ where: { id }, data });
    res.json(expense);
}
async function deleteExpense(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.expense.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Expense not found" });
    await prisma_1.prisma.expense.update({ where: { id }, data: { recyclePin: true } });
    res.status(204).send();
}
//# sourceMappingURL=expense.controller.js.map