"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSellings = listSellings;
exports.getSellingById = getSellingById;
exports.createSelling = createSelling;
exports.updateSelling = updateSelling;
exports.deleteSelling = deleteSelling;
const client_1 = require("@prisma/client");
const prisma_1 = require("../prisma");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
/** Matches `@@schema("myschema")` on models; override via `?schema=` on DATABASE_URL. */
function shopPgSchema() {
    const raw = process.env["DATABASE_URL"] ?? "";
    const m = /[?&]schema=([^&]+)/i.exec(raw);
    const s = m?.[1] ? decodeURIComponent(m[1]) : "myschema";
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) ? s : "myschema";
}
/** Quoted schema.table for raw SQL (validated schema name). */
function sellingTableRef() {
    const sch = shopPgSchema();
    return client_1.Prisma.raw(`"${sch}"."Selling"`);
}
/**
 * Writes payment columns with raw SQL so sales still work if the generated Prisma client is stale.
 * Uses `$executeRaw` tagged templates — `$executeRawUnsafe` + `$1` placeholders can break with `adapter-pg`.
 */
async function setSellingPaymentColumns(id, payment_status, payment_method) {
    const t = sellingTableRef();
    await prisma_1.prisma.$executeRaw `
    UPDATE ${t}
    SET "payment_status" = ${payment_status}, "payment_method" = ${payment_method}
    WHERE "id" = ${id}
  `;
}
async function patchSellingPaymentColumns(id, payment_status, payment_method) {
    if (!payment_status && !payment_method)
        return;
    const t = sellingTableRef();
    if (payment_status && payment_method) {
        await prisma_1.prisma.$executeRaw `
      UPDATE ${t}
      SET "payment_status" = ${payment_status}, "payment_method" = ${payment_method}
      WHERE "id" = ${id}
    `;
        return;
    }
    if (payment_status) {
        await prisma_1.prisma.$executeRaw `
      UPDATE ${t} SET "payment_status" = ${payment_status} WHERE "id" = ${id}
    `;
        return;
    }
    if (payment_method) {
        await prisma_1.prisma.$executeRaw `
      UPDATE ${t} SET "payment_method" = ${payment_method} WHERE "id" = ${id}
    `;
    }
}
function httpError(status, message) {
    const e = new Error(message);
    e.status = status;
    return e;
}
async function listSellings(_req, res) {
    const sellings = await prisma_1.prisma.selling.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
    });
    res.json(sellings);
}
async function getSellingById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const selling = await prisma_1.prisma.selling.findFirst({ where: { id, recyclePin: false } });
    if (!selling)
        return res.status(404).json({ message: "Selling not found" });
    res.json(selling);
}
async function createSelling(req, res) {
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
        const selling = await prisma_1.prisma.$transaction(async (tx) => {
            if (laptop_id) {
                const lap = await tx.laptops.findFirst({
                    where: { id: laptop_id, recyclePin: false },
                });
                if (!lap)
                    throw httpError(404, "Laptop not found");
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
                if (!acc)
                    throw httpError(404, "Accessory not found");
                if (acc.quantity < 1)
                    throw httpError(400, "Not enough stock for this accessory");
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
            await tx.$executeRaw `
        UPDATE ${t}
        SET "payment_status" = ${ps}, "payment_method" = ${pm}
        WHERE "id" = ${row.id}
      `;
            return row;
        });
        const row = await prisma_1.prisma.selling.findFirst({ where: { id: selling.id } });
        res.status(201).json(row ?? selling);
    }
    catch (e) {
        const err = e;
        if (typeof err.status === "number" && err.message) {
            return res.status(err.status).json({ message: err.message });
        }
        throw e;
    }
}
async function updateSelling(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.selling.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Selling not found" });
    const data = {};
    const laptop_id = asString(req.body?.laptop_id);
    const accessory_id = asString(req.body?.accessory_id);
    const price = asString(req.body?.price);
    const discount = asString(req.body?.discount);
    const customer_name = asString(req.body?.customer_name);
    const customer_phone = asString(req.body?.customer_phone);
    const user_id = asString(req.body?.user_id);
    const payment_status = asString(req.body?.payment_status);
    const payment_method = asString(req.body?.payment_method);
    if (typeof laptop_id !== "undefined")
        data.laptop_id = laptop_id;
    if (typeof accessory_id !== "undefined")
        data.accessory_id = accessory_id;
    if (price)
        data.price = price;
    if (discount)
        data.discount = discount;
    if (customer_name)
        data.customer_name = customer_name;
    if (customer_phone)
        data.customer_phone = customer_phone;
    if (user_id)
        data.user_id = user_id;
    if (Object.keys(data).length > 0) {
        await prisma_1.prisma.selling.update({ where: { id }, data });
    }
    await patchSellingPaymentColumns(id, payment_status, payment_method);
    const selling = await prisma_1.prisma.selling.findFirst({ where: { id, recyclePin: false } });
    if (!selling)
        return res.status(404).json({ message: "Selling not found" });
    res.json(selling);
}
async function deleteSelling(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.selling.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Selling not found" });
    await prisma_1.prisma.$transaction(async (tx) => {
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
        await tx.selling.update({ where: { id }, data: { recyclePin: true } });
    });
    res.status(204).send();
}
//# sourceMappingURL=selling.controller.js.map