import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import type { AuthedRequest } from "../middleware/auth.middleware";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function listUsers(_req: Request, res: Response) {
  const users = await prisma.user.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
  });
  res.json(users);
}

export async function getUserById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const user = await prisma.user.findFirst({
    where: { id, recyclePin: false },
    select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
}

export async function createUser(req: Request, res: Response) {
  const email = asString(req.body?.email);
  const password = asString(req.body?.password);
  const fullName = asString(req.body?.fullName);
  const role = asString(req.body?.role) as "ADMIN" | "STAFF" | undefined;

  if (!email || !password) return res.status(400).json({ message: "email and password are required" });
  if (role && role !== "ADMIN" && role !== "STAFF") return res.status(400).json({ message: "Invalid role" });

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const data: {
      email: string;
      passwordHash: string;
      fullName?: string | null;
      role?: "ADMIN" | "STAFF";
    } = { email, passwordHash };
    if (typeof req.body?.fullName === "string") data.fullName = fullName ?? null;
    if (role) data.role = role;

    const user = await prisma.user.create({
      data,
      select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
    });
    return res.status(201).json(user);
  } catch (e: any) {
    if (e?.code === "P2002") return res.status(409).json({ message: "Email already exists" });
    throw e;
  }
}

export async function updateUser(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const email = asString(req.body?.email);
  const fullName = asString(req.body?.fullName);
  const role = asString(req.body?.role) as "ADMIN" | "STAFF" | undefined;
  const password = asString(req.body?.password);

  if (role && role !== "ADMIN" && role !== "STAFF") return res.status(400).json({ message: "Invalid role" });

  const data: {
    email?: string;
    fullName?: string | null;
    role?: "ADMIN" | "STAFF";
    passwordHash?: string;
  } = {};

  if (email) data.email = email;
  if (req.body && "fullName" in req.body) {
    data.fullName = req.body.fullName === null ? null : (fullName ?? null);
  }
  if (role) data.role = role;
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.user.findFirst({ where: { id, recyclePin: false } });
    if (!existing) return res.status(404).json({ message: "User not found" });
    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
    });
    return res.json(user);
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ message: "User not found" });
    if (e?.code === "P2002") return res.status(409).json({ message: "Email already exists" });
    throw e;
  }
}

export async function deleteUser(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const actor = (req as AuthedRequest).user;
  if (actor?.sub === id) return res.status(400).json({ message: "You cannot delete your own account" });

  try {
    const existing = await prisma.user.findFirst({ where: { id, recyclePin: false } });
    if (!existing) return res.status(404).json({ message: "User not found" });
    await prisma.user.update({ where: { id }, data: { recyclePin: true } });
    return res.status(204).send();
  } catch (e: any) {
    if (e?.code === "P2025") return res.status(404).json({ message: "User not found" });
    throw e;
  }
}

