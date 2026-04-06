import type { Request, Response } from "express";
import { prisma } from "../prisma";
import { syncLoanPaymentStatus } from "./selling.controller";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function parseDate(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function createSellingLoanPayment(req: Request, res: Response) {
  const selling_id = asString(req.body?.selling_id);
  const amount = asString(req.body?.amount);
  const payment_method = asString(req.body?.payment_method);
  const paid_at = parseDate(req.body?.paid_at);
  const notes = asString(req.body?.notes);
  const user_id = asString(req.body?.user_id);

  if (!selling_id || !amount || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const selling = await prisma.selling.findFirst({ where: { id: selling_id, recyclePin: false } });
  if (!selling) return res.status(404).json({ message: "Sale not found" });
  if ((selling.payment_method ?? "").toLowerCase() !== "loan") {
    return res.status(400).json({ message: "Loan payments only apply to sales with payment method Loan" });
  }

  const payment = await prisma.sellingLoanPayment.create({
    data: {
      selling_id,
      amount,
      user_id,
      ...(payment_method ? { payment_method } : {}),
      ...(paid_at ? { paid_at } : {}),
      ...(notes ? { notes } : {}),
    },
  });

  await syncLoanPaymentStatus(selling_id);

  res.status(201).json(payment);
}

export async function deleteSellingLoanPayment(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.sellingLoanPayment.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Payment not found" });

  await prisma.sellingLoanPayment.update({ where: { id }, data: { recyclePin: true } });
  await syncLoanPaymentStatus(existing.selling_id);
  res.status(204).send();
}
