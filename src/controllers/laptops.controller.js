"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLaptops = listLaptops;
exports.getLaptopById = getLaptopById;
exports.createLaptop = createLaptop;
exports.updateLaptop = updateLaptop;
exports.deleteLaptop = deleteLaptop;
const prisma_1 = require("../prisma");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
function asBoolean(v) {
    if (typeof v === "boolean")
        return v;
    if (typeof v === "string") {
        if (v === "true")
            return true;
        if (v === "false")
            return false;
    }
    return undefined;
}
async function listLaptops(_req, res) {
    const laptops = await prisma_1.prisma.laptops.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
    });
    res.json(laptops);
}
async function getLaptopById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const laptop = await prisma_1.prisma.laptops.findFirst({
        where: { id, recyclePin: false },
    });
    if (!laptop)
        return res.status(404).json({ message: "Laptop not found" });
    res.json(laptop);
}
async function createLaptop(req, res) {
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
    const laptop = await prisma_1.prisma.laptops.create({
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
async function updateLaptop(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.laptops.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Laptop not found" });
    const data = {};
    const name = asString(req.body?.name);
    const price = asString(req.body?.price);
    const discount = asString(req.body?.discount);
    const ram = asString(req.body?.ram);
    const storage = asString(req.body?.storage);
    const processor = asString(req.body?.processor);
    const user_id = asString(req.body?.user_id);
    const is_available = asBoolean(req.body?.is_available);
    if (name)
        data.name = name;
    if (price)
        data.price = price;
    if (discount)
        data.discount = discount;
    if (ram)
        data.ram = ram;
    if (storage)
        data.storage = storage;
    if (processor)
        data.processor = processor;
    if (user_id)
        data.user_id = user_id;
    if (typeof is_available === "boolean")
        data.is_available = is_available;
    const laptop = await prisma_1.prisma.laptops.update({ where: { id }, data });
    res.json(laptop);
}
async function deleteLaptop(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const existing = await prisma_1.prisma.laptops.findFirst({ where: { id, recyclePin: false } });
    if (!existing)
        return res.status(404).json({ message: "Laptop not found" });
    await prisma_1.prisma.laptops.update({ where: { id }, data: { recyclePin: true } });
    res.status(204).send();
}
//# sourceMappingURL=laptops.controller.js.map