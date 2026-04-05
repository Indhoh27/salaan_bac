import type { Request, Response } from "express";
import { prisma } from "../prisma";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function listExpenses(_req: Request, res: Response) {
  const expenses = await prisma.expense.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
  });
  res.json(expenses);
}

export async function getExpenseById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const expense = await prisma.expense.findFirst({ where: { id, recyclePin: false } });
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  res.json(expense);
}

export async function createExpense(req: Request, res: Response) {
  const description = asString(req.body?.description);
  const amount = asString(req.body?.amount);
  const user_id = asString(req.body?.user_id);

  if (!description || !amount || !user_id) return res.status(400).json({ message: "Missing required fields" });

  const expense = await prisma.expense.create({ data: { description, amount, user_id } });
  res.status(201).json(expense);
}

export async function updateExpense(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.expense.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Expense not found" });

  const data: Parameters<typeof prisma.expense.update>[0]["data"] = {};
  const description = asString(req.body?.description);
  const amount = asString(req.body?.amount);
  const user_id = asString(req.body?.user_id);

  if (description) data.description = description;
  if (amount) data.amount = amount;
  if (user_id) data.user_id = user_id;

  const expense = await prisma.expense.update({ where: { id }, data });
  res.json(expense);
}

export async function deleteExpense(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.expense.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Expense not found" });

  await prisma.expense.update({ where: { id }, data: { recyclePin: true } });
  res.status(204).send();
}

