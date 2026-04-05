import type { Request, Response } from "express";
import { prisma } from "../prisma";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function asBoolean(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (v === "true") return true;
    if (v === "false") return false;
  }
  return undefined;
}

function asDate(v: unknown): Date | undefined {
  if (typeof v !== "string" || !v.trim()) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

export async function listJobs(_req: Request, res: Response) {
  const jobs = await prisma.job.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
  });
  res.json(jobs);
}

export async function getJobById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const job = await prisma.job.findFirst({
    where: { id, recyclePin: false },
  });
  if (!job) return res.status(404).json({ message: "Job not found" });
  res.json(job);
}

export async function createJob(req: Request, res: Response) {
  const service = asString(req.body?.service);
  const work_details = asString(req.body?.work_details);
  const price = asString(req.body?.price);
  const customer_name = asString(req.body?.customer_name);
  const customer_phone = asString(req.body?.customer_phone);
  const device_left = asBoolean(req.body?.device_left);
  const left_at = asDate(req.body?.left_at);
  const done_at = asDate(req.body?.done_at);
  const has_charger = asBoolean(req.body?.has_charger);
  const bag_type = asString(req.body?.bag_type);
  const is_completed = asBoolean(req.body?.is_completed);
  const payment_status = asString(req.body?.payment_status);
  const payment_method = asString(req.body?.payment_method);
  const user_id = asString(req.body?.user_id);

  if (!service || !price || !customer_name || !customer_phone || !payment_status || !payment_method || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const job = await prisma.job.create({
    data: {
      service,
      price,
      customer_name,
      customer_phone,
      payment_status,
      payment_method,
      user_id,
      ...(work_details ? { work_details } : {}),
      ...(typeof device_left === "boolean" ? { device_left } : {}),
      ...(left_at ? { left_at } : {}),
      ...(done_at ? { done_at } : {}),
      ...(typeof has_charger === "boolean" ? { has_charger } : {}),
      ...(bag_type ? { bag_type } : {}),
      ...(typeof is_completed === "boolean" ? { is_completed } : {}),
    },
  });
  res.status(201).json(job);
}

export async function updateJob(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.job.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Job not found" });

  const data: Parameters<typeof prisma.job.update>[0]["data"] = {};
  const service = asString(req.body?.service);
  const work_details = asString(req.body?.work_details);
  const price = asString(req.body?.price);
  const customer_name = asString(req.body?.customer_name);
  const customer_phone = asString(req.body?.customer_phone);
  const device_left = asBoolean(req.body?.device_left);
  const left_at = asDate(req.body?.left_at);
  const done_at = asDate(req.body?.done_at);
  const has_charger = asBoolean(req.body?.has_charger);
  const bag_type = asString(req.body?.bag_type);
  const is_completed = asBoolean(req.body?.is_completed);
  const payment_status = asString(req.body?.payment_status);
  const payment_method = asString(req.body?.payment_method);
  const user_id = asString(req.body?.user_id);

  if (service) data.service = service;
  if ("work_details" in (req.body ?? {})) data.work_details = work_details ?? null;
  if (price) data.price = price;
  if (customer_name) data.customer_name = customer_name;
  if (customer_phone) data.customer_phone = customer_phone;
  if (typeof device_left === "boolean") data.device_left = device_left;
  if ("left_at" in (req.body ?? {})) data.left_at = left_at ?? null;
  if ("done_at" in (req.body ?? {})) data.done_at = done_at ?? null;
  if (typeof has_charger === "boolean") data.has_charger = has_charger;
  if ("bag_type" in (req.body ?? {})) data.bag_type = bag_type ?? null;
  if (typeof is_completed === "boolean") data.is_completed = is_completed;
  if (payment_status) data.payment_status = payment_status;
  if (payment_method) data.payment_method = payment_method;
  if (user_id) data.user_id = user_id;

  const job = await prisma.job.update({ where: { id }, data });
  res.json(job);
}

export async function deleteJob(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.job.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Job not found" });

  await prisma.job.update({ where: { id }, data: { recyclePin: true } });
  res.status(204).send();
}

