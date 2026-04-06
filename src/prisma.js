"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const pg_1 = __importDefault(require("pg"));
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
/** Matches `@@schema("myschema")` on models in `prisma/schema.prisma`. */
const DEFAULT_PRISMA_PG_SCHEMA = "myschema";
const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl)
    throw new Error("DATABASE_URL is not set");
function parsePostgresUrl(connectionString) {
    const normalized = connectionString.replace(/^postgresql:\/\//i, "http://");
    return new URL(normalized);
}
function resolvePgSchema(connectionString) {
    try {
        return parsePostgresUrl(connectionString).searchParams.get("schema") ?? DEFAULT_PRISMA_PG_SCHEMA;
    }
    catch {
        return DEFAULT_PRISMA_PG_SCHEMA;
    }
}
/**
 * Prisma 7 expects a driver adapter (here `@prisma/adapter-pg`) at runtime instead of a URL on the client.
 * `?schema=` in DATABASE_URL is not always applied as PostgreSQL `search_path` for `pg`; set it on the pool
 * for `$executeRaw`, and pass the same name to `PrismaPg` so ORM queries hit `myschema` (avoids P2021).
 */
function createPool(connectionString, schema) {
    const searchPath = `-c search_path=${schema},public`;
    try {
        const url = parsePostgresUrl(connectionString);
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
            options: searchPath,
        });
    }
    catch {
        return new pg_1.default.Pool({ connectionString, options: searchPath });
    }
}
const pgSchema = resolvePgSchema(databaseUrl);
const pool = createPool(databaseUrl, pgSchema);
const adapter = new adapter_pg_1.PrismaPg(pool, { schema: pgSchema });
exports.prisma = new client_1.PrismaClient({ adapter });
//# sourceMappingURL=prisma.js.map