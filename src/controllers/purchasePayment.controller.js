"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPurchasePayments = listPurchasePayments;
exports.getPurchasePaymentById = getPurchasePaymentById;
exports.createPurchasePayment = createPurchasePayment;
exports.updatePurchasePayment = updatePurchasePayment;
exports.deletePurchasePayment = deletePurchasePayment;
const prisma_1 = require("../prisma");
const purchaseStatusSync_1 = require("../helpers/purchaseStatusSync");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function parseDate(v) {
    if (typeof v !== "string")
        return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime()))
        return undefined;
    return d;
}
async function listPurchasePayments(_req, res) {
    const payments = await prisma_1.prisma.purchasePayment.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
    });
    res.json(payments);
}
async function getPurchasePaymentById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const payment = await prisma_1.prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
    if (!payment)
        return res.status(404).json({ message: "Purchase payment not found" });
    res.json(payment);
}
async function createPurchasePayment(req, res) {
    const purchase_id = asString(req.body?.purchase_id);
    const amount = asString(req.body?.amount);
    const payment_method = asString(req.body?.payment_method);
    const paid_at = parseDate(req.body?.paid_at);
    const notes = asString(req.body?.notes);
    const user_id = asString(req.body?.user_id);
    if (!purchase_id || !amount || !user_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const purchaseOk = await prisma_1.prisma.purchase.findFirst({
        where: { id: purchase_id, recyclePin: false },
    });
    if (!purchaseOk) {
        return res.status(404).json({ message: "Purchase not found" });
    }
    const payment = await prisma_1.prisma.purchasePayment.create({
        data: {
            purchase_id,
            amount,
            user_id,
            ...(payment_method ? { payment_method } : {}),
            ...(paid_at ? { paid_at } : {}),
            ...(notes ? { notes } : {}),
        },
    });
    await (0, purchaseStatusSync_1.recalcPurchaseStatus)(purchase_id);
    res.status(201).json(payment);
}
async function updatePurchasePayment(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Purchase payment not found" });
    const data = {};
    const purchase_id = asString(req.body?.purchase_id);
    const amount = asString(req.body?.amount);
    const payment_method = asString(req.body?.payment_method);
    const paid_at = parseDate(req.body?.paid_at);
    const notes = asString(req.body?.notes);
    const user_id = asString(req.body?.user_id);
    if (purchase_id)
        data.purchase_id = purchase_id;
    if (amount)
        data.amount = amount;
    if (payment_method)
        data.payment_method = payment_method;
    if (paid_at)
        data.paid_at = paid_at;
    if (notes)
        data.notes = notes;
    if (user_id)
        data.user_id = user_id;
    const oldPurchaseId = existing.purchase_id;
    const payment = await prisma_1.prisma.purchasePayment.update({ where: { id }, data });
    await (0, purchaseStatusSync_1.recalcPurchaseStatus)(payment.purchase_id);
    if (payment.purchase_id !== oldPurchaseId) {
        await (0, purchaseStatusSync_1.recalcPurchaseStatus)(oldPurchaseId);
    }
    res.json(payment);
}
async function deletePurchasePayment(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.purchasePayment.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Purchase payment not found" });
    await prisma_1.prisma.purchasePayment.update({ where: { id }, data: { recyclePin: true } });
    await (0, purchaseStatusSync_1.recalcPurchaseStatus)(existing.purchase_id);
    res.status(204).send();
}
//# sourceMappingURL=purchasePayment.controller.js.map