import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { decode } from "jsonwebtoken";
import { prisma } from "../prisma";
import { ACCESS_COOKIE, clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "../helpers/authCookies";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type JwtUserPayload,
} from "../helpers/jwt";

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function tokenExpToDate(token: string): Date | null {
  const decoded = decode(token) as { exp?: number } | null;
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
}

function userJson(user: {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "STAFF";
}) {
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role };
}

export async function login(req: Request, res: Response) {
  const email = asString(req.body?.email);
  const password = asString(req.body?.password);

  if (!email || !password) return res.status(400).json({ message: "email and password are required" });

  const user = await prisma.user.findFirst({
    where: { email, recyclePin: false },
    select: { id: true, email: true, passwordHash: true, fullName: true, role: true },
  });

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const payload: JwtUserPayload = { sub: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const accessTokenExpires = tokenExpToDate(accessToken);
  const refreshTokenExpires = tokenExpToDate(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken,
      accessTokenExpires: accessTokenExpires ?? null,
      refreshToken,
      refreshTokenExpires: refreshTokenExpires ?? null,
    },
  });

  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    user: userJson({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }),
  });
}

export async function me(req: Request, res: Response) {
  const fromHeader =
    typeof req.headers.authorization === "string" && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7).trim()
      : "";
  const raw = fromHeader || req.cookies?.[ACCESS_COOKIE];

  if (!raw) return res.status(401).json({ message: "Unauthorized" });

  let payload: JwtUserPayload;
  try {
    payload = verifyAccessToken(raw);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.sub, recyclePin: false },
    select: { id: true, email: true, fullName: true, role: true },
  });
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  return res.json({ user: userJson(user) });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "No refresh token" });
  }

  let payload: JwtUserPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const row = await prisma.user.findFirst({
    where: { id: payload.sub, recyclePin: false, refreshToken },
    select: { id: true, email: true, fullName: true, role: true },
  });
  if (!row) {
    clearAuthCookies(res);
    return res.status(401).json({ message: "Session expired" });
  }

  const nextPayload: JwtUserPayload = { sub: row.id, role: row.role };
  const accessToken = signAccessToken(nextPayload);
  const nextRefresh = signRefreshToken(nextPayload);
  const accessTokenExpires = tokenExpToDate(accessToken);
  const refreshTokenExpires = tokenExpToDate(nextRefresh);

  await prisma.user.update({
    where: { id: row.id },
    data: {
      accessToken,
      accessTokenExpires: accessTokenExpires ?? null,
      refreshToken: nextRefresh,
      refreshTokenExpires: refreshTokenExpires ?? null,
    },
  });

  setAuthCookies(res, accessToken, nextRefresh);

  return res.json({ user: userJson(row) });
}

export async function logout(req: Request, res: Response) {
  const access = req.cookies?.[ACCESS_COOKIE];
  try {
    if (access) {
      const { sub } = verifyAccessToken(access);
      await prisma.user.update({
        where: { id: sub },
        data: {
          accessToken: null,
          accessTokenExpires: null,
          refreshToken: null,
          refreshTokenExpires: null,
        },
      });
    }
  } catch {
    /* ignore invalid access token */
  }
  clearAuthCookies(res);
  return res.status(204).send();
}
