import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PrismaClient as PrismaClientType } from "@prisma/client";

/** PostgreSQL `search_path` / adapter schema when the URL has no `?schema=` query param. */
const DEFAULT_PRISMA_PG_SCHEMA = process.env["PG_SCHEMA"]?.trim() || "myschema";

function resolveDatabaseUrl(): string {
  const url =
    process.env["DATABASE_URL"] ??
    process.env["POSTGRES_URL"] ??
    process.env["POSTGRES_PRISMA_URL"] ??
    process.env["PRISMA_DATABASE_URL"];
  if (!url?.trim()) {
    throw new Error(
      "Database URL is not set. Define DATABASE_URL in your deployment (or POSTGRES_URL / POSTGRES_PRISMA_URL). " +
        "For local dev, add it to a .env file in the project root.",
    );
  }
  return url.trim();
}

const databaseUrl = resolveDatabaseUrl();

function parsePostgresUrl(connectionString: string): URL {
  const normalized = connectionString.replace(/^postgresql:\/\//i, "http://");
  return new URL(normalized);
}

function resolvePgSchema(connectionString: string): string {
  try {
    return parsePostgresUrl(connectionString).searchParams.get("schema") ?? DEFAULT_PRISMA_PG_SCHEMA;
  } catch {
    return DEFAULT_PRISMA_PG_SCHEMA;
  }
}

/**
 * Prisma 7 expects a driver adapter (here `@prisma/adapter-pg`) at runtime instead of a URL on the client.
 * `?schema=` in DATABASE_URL is not always applied as PostgreSQL `search_path` for `pg`; set it on the pool
 * for `$executeRaw`, and pass the same name to `PrismaPg` so ORM queries hit `myschema` (avoids P2021).
 */
function createPool(connectionString: string, schema: string): pg.Pool {
  const searchPath = `-c search_path=${schema},public`;
  try {
    const url = parsePostgresUrl(connectionString);
    const host = url.hostname;
    const port = Number(url.port) || 5432;
    const user = decodeURIComponent(url.username || "");
    const password = decodeURIComponent(url.password || "");
    const database = url.pathname.replace(/^\//, "");
    return new pg.Pool({
      host,
      port,
      user,
      password,
      database,
      options: searchPath,
    });
  } catch {
    return new pg.Pool({ connectionString, options: searchPath });
  }
}

const pgSchema = resolvePgSchema(databaseUrl);
const pool = createPool(databaseUrl, pgSchema);
const adapter = new PrismaPg(pool, { schema: pgSchema });
export const prisma: PrismaClientType = new PrismaClient({ adapter });
