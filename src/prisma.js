"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const pg_1 = __importDefault(require("pg"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("../generated/prisma/client");
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl)
    throw new Error("DATABASE_URL is not set");
function parsePostgresUrl(connectionString) {
    const normalized = connectionString.replace(/^postgresql:\/\//i, "http://");
    return new URL(normalized);
}
/**
 * `?schema=myschema` in DATABASE_URL is not always applied as PostgreSQL `search_path` when using
 * `@prisma/adapter-pg`. Set `search_path` on the pool for raw SQL, and pass the same name to the
 * adapter so ORM queries target that schema (otherwise they use `public` and you get P2021).
 */
function createPool(connectionString) {
    try {
        const url = parsePostgresUrl(connectionString);
        const schema = url.searchParams.get("schema");
        if (!schema) {
            return new pg_1.default.Pool({ connectionString });
        }
        const host = url.hostname;
        const port = Number(url.port) || 5432;
        const user = decodeURIComponent(url.username || "");
        const password = decodeURIComponent(url.password || "");
        const database = url.pathname.replace(/^\//, "");
        return new pg_1.default.Pool({
            host,
            port,
            user,
            password,
            database,
            options: `-c search_path=${schema},public`,
        });
    }
    catch {
        return new pg_1.default.Pool({ connectionString });
    }
}
function schemaFromDatabaseUrl(connectionString) {
    try {
        return parsePostgresUrl(connectionString).searchParams.get("schema") ?? undefined;
    }
    catch {
        return undefined;
    }
}
const pool = createPool(databaseUrl);
const pgSchema = schemaFromDatabaseUrl(databaseUrl);
const adapter = new adapter_pg_1.PrismaPg(pool, pgSchema ? { schema: pgSchema } : undefined);
exports.prisma = new client_1.PrismaClient({ adapter });
//# sourceMappingURL=prisma.js.map