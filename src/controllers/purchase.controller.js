"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPurchases = listPurchases;
exports.getPurchaseById = getPurchaseById;
exports.createPurchase = createPurchase;
exports.updatePurchase = updatePurchase;
exports.deletePurchase = deletePurchase;
const prisma_1 = require("../prisma");
const purchaseStatusSync_1 = require("../helpers/purchaseStatusSync");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
const purchaseInclude = {
    payments: {
        where: { recyclePin: false },
        orderBy: { paid_at: "desc" },
    },
};
async function listPurchases(_req, res) {
    const purchases = await prisma_1.prisma.purchase.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
        include: purchaseInclude,
    });
    res.json(purchases);
}
async function getPurchaseById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const purchase = await prisma_1.prisma.purchase.findFirst({
        where: { id, recyclePin: false },
        include: purchaseInclude,
    });
    if (!purchase)
        return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
}
async function createPurchase(req, res) {
    const seller_name = asString(req.body?.seller_name);
    const seller_phone = asString(req.body?.seller_phone);
    const laptop_name = asString(req.body?.laptop_name);
    const accessory_name = asString(req.body?.accessory_name);
    const item_description = asString(req.body?.item_description);
    const agreed_price = asString(req.body?.agreed_price);
    const status = asString(req.body?.status);
    const notes = asString(req.body?.notes);
    const user_id = asString(req.body?.user_id);
    if (!seller_name || !seller_phone || !agreed_price || !user_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (!laptop_name && !accessory_name && !item_description) {
        return res.status(400).json({
            message: "Describe what you bought: laptop name, accessory name, or other description",
        });
    }
    const allowed = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];
    const safeStatus = status && allowed.includes(status) ? status : undefined;
    const purchase = await prisma_1.prisma.purchase.create({
        data: {
            seller_name,
            seller_phone,
            agreed_price,
            user_id,
            ...(laptop_name ? { laptop_name } : {}),
            ...(accessory_name ? { accessory_name } : {}),
            ...(item_description ? { item_description } : {}),
            ...(safeStatus ? { status: safeStatus } : {}),
            ...(notes ? { notes } : {}),
        },
    });
    res.status(201).json(purchase);
}
async function updatePurchase(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.purchase.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Purchase not found" });
    const data = {};
    const seller_name = asString(req.body?.seller_name);
    const seller_phone = asString(req.body?.seller_phone);
    const laptop_name = asString(req.body?.laptop_name);
    const accessory_name = asString(req.body?.accessory_name);
    const item_description = asString(req.body?.item_description);
    const agreed_price = asString(req.body?.agreed_price);
    const status = asString(req.body?.status);
    const notes = asString(req.body?.notes);
    const user_id = asString(req.body?.user_id);
    if (seller_name)
        data.seller_name = seller_name;
    if (seller_phone)
        data.seller_phone = seller_phone;
    if (laptop_name)
        data.laptop_name = laptop_name;
    if (accessory_name)
        data.accessory_name = accessory_name;
    if (item_description)
        data.item_description = item_description;
    if (agreed_price)
        data.agreed_price = agreed_price;
    if (notes)
        data.notes = notes;
    if (user_id)
        data.user_id = user_id;
    const allowed = ["PENDING", "PARTIAL", "PAID", "CANCELLED"];
    if (status && allowed.includes(status))
        data.status = status;
    const purchase = await prisma_1.prisma.purchase.update({ where: { id }, data });
    if (agreed_price) {
        await (0, purchaseStatusSync_1.recalcPurchaseStatus)(id);
        const refreshed = await prisma_1.prisma.purchase.findFirst({
            where: { id, recyclePin: false },
            include: purchaseInclude,
        });
        return res.json(refreshed ?? purchase);
    }
    const withPayments = await prisma_1.prisma.purchase.findFirst({
        where: { id, recyclePin: false },
        include: purchaseInclude,
    });
    res.json(withPayments ?? purchase);
}
async function deletePurchase(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.purchase.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Purchase not found" });
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.purchasePayment.updateMany({ where: { purchase_id: id }, data: { recyclePin: true } }),
        prisma_1.prisma.purchase.update({ where: { id }, data: { recyclePin: true } }),
    ]);
    res.status(204).send();
}
//# sourceMappingURL=purchase.controller.js.map