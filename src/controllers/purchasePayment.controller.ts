import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { recalcPurchaseStatus } from "../helpers/purchaseStatusSync";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function parseDate(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function listPurchasePayments(_req: Request, res: Response) {
  const payments = await prisma.purchasePayment.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
}

export async function getPurchasePaymentById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const payment = await prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
  if (!payment) return res.status(404).json({ message: "Purchase payment not found" });
  res.json(payment);
}

export async function createPurchasePayment(req: Request, res: Response) {
  const purchase_id = asString(req.body?.purchase_id);
  const amount = asString(req.body?.amount);
  const payment_method = asString(req.body?.payment_method);
  const paid_at = parseDate(req.body?.paid_at);
  const notes = asString(req.body?.notes);
  const user_id = asString(req.body?.user_id);

  if (!purchase_id || !amount || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const purchaseOk = await prisma.purchase.findFirst({
    where: { id: purchase_id, recyclePin: false },
  });
  if (!purchaseOk) {
    return res.status(404).json({ message: "Purchase not found" });
  }

  const payment = await prisma.purchasePayment.create({
    data: {
      purchase_id,
      amount,
      user_id,
      ...(payment_method ? { payment_method } : {}),
      ...(paid_at ? { paid_at } : {}),
      ...(notes ? { notes } : {}),
    },
  });

  await recalcPurchaseStatus(purchase_id);

  res.status(201).json(payment);
}

export async function updatePurchasePayment(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Purchase payment not found" });

  const data: Parameters<typeof prisma.purchasePayment.update>[0]["data"] = {};
  const purchase_id = asString(req.body?.purchase_id);
  const amount = asString(req.body?.amount);
  const payment_method = asString(req.body?.payment_method);
  const paid_at = parseDate(req.body?.paid_at);
  const notes = asString(req.body?.notes);
  const user_id = asString(req.body?.user_id);

  if (purchase_id) data.purchase_id = purchase_id;
  if (amount) data.amount = amount;
  if (payment_method) data.payment_method = payment_method;
  if (paid_at) data.paid_at = paid_at;
  if (notes) data.notes = notes;
  if (user_id) data.user_id = user_id;

  const oldPurchaseId = existing.purchase_id;
  const payment = await prisma.purchasePayment.update({ where: { id }, data });
  await recalcPurchaseStatus(payment.purchase_id);
  if (payment.purchase_id !== oldPurchaseId) {
    await recalcPurchaseStatus(oldPurchaseId);
  }
  res.json(payment);
}

export async function deletePurchasePayment(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Purchase payment not found" });

  await prisma.purchasePayment.update({ where: { id }, data: { recyclePin: true } });
  await recalcPurchaseStatus(existing.purchase_id);
  res.status(204).send();
}

