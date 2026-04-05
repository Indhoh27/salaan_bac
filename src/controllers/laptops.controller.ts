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

export async function listLaptops(_req: Request, res: Response) {
  const laptops = await prisma.laptops.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
  });
  res.json(laptops);
}

export async function getLaptopById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const laptop = await prisma.laptops.findFirst({
    where: { id, recyclePin: false },
  });
  if (!laptop) return res.status(404).json({ message: "Laptop not found" });
  res.json(laptop);
}

export async function createLaptop(req: Request, res: Response) {
  const name = asString(req.body?.name);
  const price = asString(req.body?.price);
  const discount = asString(req.body?.discount);
  const ram = asString(req.body?.ram);
  const storage = asString(req.body?.storage);
  const processor = asString(req.body?.processor);
  const user_id = asString(req.body?.user_id);
  const is_available = asBoolean(req.body?.is_available);

  if (!name || !price || !discount || !ram || !storage || !processor || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const laptop = await prisma.laptops.create({
    data: {
      name,
      price,
      discount,
      ram,
      storage,
      processor,
      user_id,
      ...(typeof is_available === "boolean" ? { is_available } : {}),
    },
  });
  res.status(201).json(laptop);
}

export async function updateLaptop(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.laptops.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Laptop not found" });

  const data: Parameters<typeof prisma.laptops.update>[0]["data"] = {};
  const name = asString(req.body?.name);
  const price = asString(req.body?.price);
  const discount = asString(req.body?.discount);
  const ram = asString(req.body?.ram);
  const storage = asString(req.body?.storage);
  const processor = asString(req.body?.processor);
  const user_id = asString(req.body?.user_id);
  const is_available = asBoolean(req.body?.is_available);

  if (name) data.name = name;
  if (price) data.price = price;
  if (discount) data.discount = discount;
  if (ram) data.ram = ram;
  if (storage) data.storage = storage;
  if (processor) data.processor = processor;
  if (user_id) data.user_id = user_id;
  if (typeof is_available === "boolean") data.is_available = is_available;

  const laptop = await prisma.laptops.update({ where: { id }, data });
  res.json(laptop);
}

export async function deleteLaptop(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.laptops.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Laptop not found" });

  await prisma.laptops.update({ where: { id }, data: { recyclePin: true } });
  res.status(204).send();
}

