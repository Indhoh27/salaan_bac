"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAccessories = listAccessories;
exports.getAccessoryById = getAccessoryById;
exports.createAccessory = createAccessory;
exports.updateAccessory = updateAccessory;
exports.deleteAccessory = deleteAccessory;
const prisma_1 = require("../prisma");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function asNonNegativeInt(v) {
    if (typeof v === "number" && Number.isFinite(v)) {
        const n = Math.floor(v);
        return n >= 0 ? n : undefined;
    }
    if (typeof v === "string" && v.trim()) {
        const n = parseInt(v.trim(), 10);
        if (!Number.isNaN(n) && n >= 0)
            return n;
    }
    return undefined;
}
async function listAccessories(_req, res) {
    const accessories = await prisma_1.prisma.accessory.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
    });
    res.json(accessories);
}
async function getAccessoryById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const accessory = await prisma_1.prisma.accessory.findFirst({ where: { id, recyclePin: false } });
    if (!accessory)
        return res.status(404).json({ message: "Accessory not found" });
    res.json(accessory);
}
async function createAccessory(req, res) {
    const name = asString(req.body?.name);
    const price = asString(req.body?.price);
    const discount = asString(req.body?.discount);
    const category = asString(req.body?.category);
    const user_id = asString(req.body?.user_id);
    const quantity = asNonNegativeInt(req.body?.quantity);
    if (!name || !price || !discount || !user_id)
        return res.status(400).json({ message: "Missing required fields" });
    const accessory = await prisma_1.prisma.accessory.create({
        data: {
            name,
            price,
            discount,
            user_id,
            ...(category ? { category } : {}),
            ...(quantity !== undefined ? { quantity } : {}),
        },
    });
    res.status(201).json(accessory);
}
async function updateAccessory(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.accessory.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Accessory not found" });
    const data = {};
    const name = asString(req.body?.name);
    const price = asString(req.body?.price);
    const discount = asString(req.body?.discount);
    const category = asString(req.body?.category);
    const user_id = asString(req.body?.user_id);
    const quantity = asNonNegativeInt(req.body?.quantity);
    if (name)
        data.name = name;
    if (price)
        data.price = price;
    if (discount)
        data.discount = discount;
    if (category)
        data.category = category;
    if (user_id)
        data.user_id = user_id;
    if (quantity !== undefined)
        data.quantity = quantity;
    const accessory = await prisma_1.prisma.accessory.update({ where: { id }, data });
    res.json(accessory);
}
async function deleteAccessory(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.accessory.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Accessory not found" });
    await prisma_1.prisma.accessory.update({ where: { id }, data: { recyclePin: true } });
    res.status(204).send();
}
//# sourceMappingURL=accessory.controller.js.map