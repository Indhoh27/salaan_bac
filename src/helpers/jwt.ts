import { sign, verify, type Secret, type SignOptions } from "jsonwebtoken";

export type JwtUserPayload = {
  sub: string;
  role: "ADMIN" | "STAFF";
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

const ACCESS_SECRET = (): Secret => requireEnv("JWT_ACCESS_SECRET");
const REFRESH_SECRET = (): Secret => requireEnv("JWT_REFRESH_SECRET");

type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;
const ACCESS_EXPIRES_IN = (): ExpiresIn => (process.env["JWT_ACCESS_EXPIRES_IN"] ?? "15m") as ExpiresIn;
const REFRESH_EXPIRES_IN = (): ExpiresIn => (process.env["JWT_REFRESH_EXPIRES_IN"] ?? "30d") as ExpiresIn;

export function signAccessToken(payload: JwtUserPayload): string {
  return sign(payload, ACCESS_SECRET(), { expiresIn: ACCESS_EXPIRES_IN() });
}

export function signRefreshToken(payload: JwtUserPayload): string {
  return sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES_IN() });
}

export function verifyAccessToken(token: string): JwtUserPayload {
  return verify(token, ACCESS_SECRET()) as JwtUserPayload;
}

export function verifyRefreshToken(token: string): JwtUserPayload {
  return verify(token, REFRESH_SECRET()) as JwtUserPayload;
}

