"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../src/prisma");
async function main() {
    const email = process.env["SEED_ADMIN_EMAIL"] ?? "admin@salaan.local";
    const password = process.env["SEED_ADMIN_PASSWORD"] ?? "admin123";
    const fullName = process.env["SEED_ADMIN_NAME"] ?? "Admin";
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.upsert({
        where: { email },
        create: {
            email,
            passwordHash,
            fullName,
            role: "ADMIN",
            recyclePin: false,
        },
        update: {
            passwordHash,
            fullName,
            role: "ADMIN",
            recyclePin: false,
        },
        select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });
    console.log("Seeded user:", user);
    console.log("Login with:", { email, password });
}
main()
    .catch((e) => {
    console.error(e);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map