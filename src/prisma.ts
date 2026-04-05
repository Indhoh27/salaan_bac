import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type PrismaClient as PrismaClientType } from "../generated/prisma/client";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

function parsePostgresUrl(connectionString: string): URL {
  const normalized = connectionString.replace(/^postgresql:\/\//i, "http://");
  return new URL(normalized);
}

/**
 * `?schema=myschema` in DATABASE_URL is not always applied as PostgreSQL `search_path` when using
 * `@prisma/adapter-pg`. Set `search_path` on the pool for raw SQL, and pass the same name to the
 * adapter so ORM queries target that schema (otherwise they use `public` and you get P2021).
 */
function createPool(connectionString: string): pg.Pool {
  try {
    const url = parsePostgresUrl(connectionString);
    const schema = url.searchParams.get("schema");
    if (!schema) {
      return new pg.Pool({ connectionString });
    }
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
      options: `-c search_path=${schema},public`,
    });
  } catch {
    return new pg.Pool({ connectionString });
  }
}

function schemaFromDatabaseUrl(connectionString: string): string | undefined {
  try {
    return parsePostgresUrl(connectionString).searchParams.get("schema") ?? undefined;
  } catch {
    return undefined;
  }
}

const pool = createPool(databaseUrl);
const pgSchema = schemaFromDatabaseUrl(databaseUrl);
const adapter = new PrismaPg(pool, pgSchema ? { schema: pgSchema } : undefined);
export const prisma: PrismaClientType = new PrismaClient({ adapter });
