import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { parseMoney } from "../helpers/money";
import { prisma } from "../prisma";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Matches `@@schema("myschema")` on models; override via `?schema=` on DATABASE_URL. */
function shopPgSchema(): string {
  const raw = process.env["DATABASE_URL"] ?? "";
  const m = /[?&]schema=([^&]+)/i.exec(raw);
  const s = m?.[1] ? decodeURIComponent(m[1]) : "myschema";
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) ? s : "myschema";
}

/** Quoted schema.table for raw SQL (validated schema name). */
function sellingTableRef() {
  const sch = shopPgSchema();
  return Prisma.raw(`"${sch}"."Selling"`);
}

/**
 * Writes payment columns with raw SQL so sales still work if the generated Prisma client is stale.
 * Uses `$executeRaw` tagged templates — `$executeRawUnsafe` + `$1` placeholders can break with `adapter-pg`.
 */
async function setSellingPaymentColumns(id: string, payment_status: string, payment_method: string) {
  const t = sellingTableRef();
  await prisma.$executeRaw`
    UPDATE ${t}
    SET "payment_status" = ${payment_status}, "payment_method" = ${payment_method}
    WHERE "id" = ${id}
  `;
}

export async function patchSellingPaymentColumns(
  id: string,
  payment_status: string | undefined,
  payment_method: string | undefined,
) {
  if (!payment_status && !payment_method) return;
  const t = sellingTableRef();
  if (payment_status && payment_method) {
    await prisma.$executeRaw`
      UPDATE ${t}
      SET "payment_status" = ${payment_status}, "payment_method" = ${payment_method}
      WHERE "id" = ${id}
    `;
    return;
  }
  if (payment_status) {
    await prisma.$executeRaw`
      UPDATE ${t} SET "payment_status" = ${payment_status} WHERE "id" = ${id}
    `;
    return;
  }
  if (payment_method) {
    await prisma.$executeRaw`
      UPDATE ${t} SET "payment_method" = ${payment_method} WHERE "id" = ${id}
    `;
  }
}

function httpError(status: number, message: string): Error & { status: number } {
  const e = new Error(message) as Error & { status: number };
  e.status = status;
  return e;
}

const sellingLoanPaymentInclude = {
  loanPayments: {
    where: { recyclePin: false },
    orderBy: { paid_at: "desc" as const },
  },
} as const;

/** Recompute `payment_status` for a loan sale from recorded loan payments vs net amount. */
export async function syncLoanPaymentStatus(sellingId: string): Promise<void> {
  const selling = await prisma.selling.findFirst({ where: { id: sellingId, recyclePin: false } });
  if (!selling) return;
  if ((selling.payment_method ?? "").toLowerCase() !== "loan") return;

  const payments = await prisma.sellingLoanPayment.findMany({
    where: { selling_id: sellingId, recyclePin: false },
  });
  const paid = payments.reduce((sum, p) => sum + parseMoney(p.amount), 0);
  const net = Math.max(0, parseMoney(selling.price) - parseMoney(selling.discount));
  const pm = selling.payment_method ?? "loan";
  if (net <= 0 || paid + 1e-6 >= net) {
    await patchSellingPaymentColumns(sellingId, "fulfilled", pm);
  } else {
    await patchSellingPaymentColumns(sellingId, "pending", pm);
  }
}

export async function listSellings(_req: Request, res: Response) {
  const sellings = await prisma.selling.findMany({
    where: { recyclePin: false },
    orderBy: { createdAt: "desc" },
    include: sellingLoanPaymentInclude,
  });
  res.json(sellings);
}

export async function getSellingById(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const selling = await prisma.selling.findFirst({
    where: { id, recyclePin: false },
    include: sellingLoanPaymentInclude,
  });
  if (!selling) return res.status(404).json({ message: "Selling not found" });
  res.json(selling);
}

export async function createSelling(req: Request, res: Response) {
  const laptop_id = asString(req.body?.laptop_id);
  const accessory_id = asString(req.body?.accessory_id);
  const price = asString(req.body?.price);
  const discount = asString(req.body?.discount);
  const customer_name = asString(req.body?.customer_name);
  const customer_phone = asString(req.body?.customer_phone);
  const user_id = asString(req.body?.user_id);
  const payment_status = asString(req.body?.payment_status);
  const payment_method = asString(req.body?.payment_method);

  if (!price || !discount || !customer_name || !customer_phone || !user_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (!laptop_id && !accessory_id) {
    return res.status(400).json({ message: "Select a laptop or an accessory" });
  }
  if (laptop_id && accessory_id) {
    return res.status(400).json({ message: "One sale line cannot include both a laptop and an accessory" });
  }

  try {
    const selling = await prisma.$transaction(async (tx) => {
      if (laptop_id) {
        const lap = await tx.laptops.findFirst({
          where: { id: laptop_id, recyclePin: false },
        });
        if (!lap) throw httpError(404, "Laptop not found");
        if (!lap.is_available) {
          throw httpError(400, "This laptop is not available (already sold or marked unavailable)");
        }
        await tx.laptops.update({
          where: { id: laptop_id },
          data: { is_available: false },
        });
      }
      if (accessory_id) {
        const acc = await tx.accessory.findFirst({
          where: { id: accessory_id, recyclePin: false },
        });
        if (!acc) throw httpError(404, "Accessory not found");
        if (acc.quantity < 1) throw httpError(400, "Not enough stock for this accessory");
        await tx.accessory.update({
          where: { id: accessory_id },
          data: { quantity: acc.quantity - 1 },
        });
      }

      const row = await tx.selling.create({
        data: {
          price,
          discount,
          customer_name,
          customer_phone,
          user_id,
          ...(laptop_id ? { laptop_id } : {}),
          ...(accessory_id ? { accessory_id } : {}),
        },
      });

      const t = sellingTableRef();
      const ps = payment_status ?? "pending";
      const pm = payment_method ?? "cash";
      await tx.$executeRaw`
        UPDATE ${t}
        SET "payment_status" = ${ps}, "payment_method" = ${pm}
        WHERE "id" = ${row.id}
      `;
      return row;
    });

    const row = await prisma.selling.findFirst({
      where: { id: selling.id },
      include: sellingLoanPaymentInclude,
    });
    res.status(201).json(row ?? selling);
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string };
    if (typeof err.status === "number" && err.message) {
      return res.status(err.status).json({ message: err.message });
    }
    throw e;
  }
}

export async function updateSelling(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.selling.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Selling not found" });

  const data: Parameters<typeof prisma.selling.update>[0]["data"] = {};
  const laptop_id = asString(req.body?.laptop_id);
  const accessory_id = asString(req.body?.accessory_id);
  const price = asString(req.body?.price);
  const discount = asString(req.body?.discount);
  const customer_name = asString(req.body?.customer_name);
  const customer_phone = asString(req.body?.customer_phone);
  const user_id = asString(req.body?.user_id);
  const payment_status = asString(req.body?.payment_status);
  const payment_method = asString(req.body?.payment_method);

  if (typeof laptop_id !== "undefined") data.laptop_id = laptop_id;
  if (typeof accessory_id !== "undefined") data.accessory_id = accessory_id;
  if (price) data.price = price;
  if (discount) data.discount = discount;
  if (customer_name) data.customer_name = customer_name;
  if (customer_phone) data.customer_phone = customer_phone;
  if (user_id) data.user_id = user_id;

  if (Object.keys(data).length > 0) {
    await prisma.selling.update({ where: { id }, data });
  }
  await patchSellingPaymentColumns(id, payment_status, payment_method);
  const mid = await prisma.selling.findFirst({ where: { id, recyclePin: false } });
  if (mid && (mid.payment_method ?? "").toLowerCase() === "loan") {
    await syncLoanPaymentStatus(id);
  }
  const selling = await prisma.selling.findFirst({
    where: { id, recyclePin: false },
    include: sellingLoanPaymentInclude,
  });
  if (!selling) return res.status(404).json({ message: "Selling not found" });
  res.json(selling);
}

export async function deleteSelling(req: Request, res: Response) {
  const rawId = req.params["id"];
  const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!id) return res.status(400).json({ message: "Missing id" });

  const existing = await prisma.selling.findFirst({ where: { id, recyclePin: false } });
  if (!existing) return res.status(404).json({ message: "Selling not found" });

  await prisma.$transaction(async (tx) => {
    if (existing.laptop_id) {
      await tx.laptops.updateMany({
        where: { id: existing.laptop_id, recyclePin: false },
        data: { is_available: true },
      });
    }
    if (existing.accessory_id) {
      const acc = await tx.accessory.findFirst({
        where: { id: existing.accessory_id, recyclePin: false },
      });
      if (acc) {
        await tx.accessory.update({
          where: { id: acc.id },
          data: { quantity: acc.quantity + 1 },
        });
      }
    }
    await tx.sellingLoanPayment.updateMany({
      where: { selling_id: id },
      data: { recyclePin: true },
    });
    await tx.selling.update({ where: { id }, data: { recyclePin: true } });
  });
  res.status(204).send();
}

