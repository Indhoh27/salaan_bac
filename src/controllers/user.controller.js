"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
exports.getUserById = getUserById;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../prisma");
function asString(v) {
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
async function listUsers(_req, res) {
    const users = await prisma_1.prisma.user.findMany({
        where: { recyclePin: false },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
    });
    res.json(users);
}
async function getUserById(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const user = await prisma_1.prisma.user.findFirst({
        where: { id, recyclePin: false },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user)
        return res.status(404).json({ message: "User not found" });
    res.json(user);
}
async function createUser(req, res) {
    const email = asString(req.body?.email);
    const password = asString(req.body?.password);
    const fullName = asString(req.body?.fullName);
    const role = asString(req.body?.role);
    if (!email || !password)
        return res.status(400).json({ message: "email and password are required" });
    if (role && role !== "ADMIN" && role !== "STAFF")
        return res.status(400).json({ message: "Invalid role" });
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    try {
        const data = { email, passwordHash };
        if (typeof req.body?.fullName === "string")
            data.fullName = fullName ?? null;
        if (role)
            data.role = role;
        const user = await prisma_1.prisma.user.create({
            data,
            select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
        });
        return res.status(201).json(user);
    }
    catch (e) {
        if (e?.code === "P2002")
            return res.status(409).json({ message: "Email already exists" });
        throw e;
    }
}
async function updateUser(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const email = asString(req.body?.email);
    const fullName = asString(req.body?.fullName);
    const role = asString(req.body?.role);
    const password = asString(req.body?.password);
    if (role && role !== "ADMIN" && role !== "STAFF")
        return res.status(400).json({ message: "Invalid role" });
    const data = {};
    if (email)
        data.email = email;
    if (req.body && "fullName" in req.body) {
        data.fullName = req.body.fullName === null ? null : (fullName ?? null);
    }
    if (role)
        data.role = role;
    if (password)
        data.passwordHash = await bcrypt_1.default.hash(password, 10);
    try {
        const existing = await prisma_1.prisma.user.findFirst({ where: { id, recyclePin: false } });
        if (!existing)
            return res.status(404).json({ message: "User not found" });
        const user = await prisma_1.prisma.user.update({
            where: { id },
            data,
            select: { id: true, email: true, fullName: true, role: true, createdAt: true, updatedAt: true },
        });
        return res.json(user);
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ message: "User not found" });
        if (e?.code === "P2002")
            return res.status(409).json({ message: "Email already exists" });
        throw e;
    }
}
async function deleteUser(req, res) {
    const rawId = req.params["id"];
    const id = asString(Array.isArray(rawId) ? rawId[0] : rawId);
    if (!id)
        return res.status(400).json({ message: "Missing id" });
    const actor = req.user;
    if (actor?.sub === id)
        return res.status(400).json({ message: "You cannot delete your own account" });
    try {
        const existing = await prisma_1.prisma.user.findFirst({ where: { id, recyclePin: false } });
        if (!existing)
            return res.status(404).json({ message: "User not found" });
        await prisma_1.prisma.user.update({ where: { id }, data: { recyclePin: true } });
        return res.status(204).send();
    }
    catch (e) {
        if (e?.code === "P2025")
            return res.status(404).json({ message: "User not found" });
        throw e;
    }
}
//# sourceMappingURL=user.controller.js.map