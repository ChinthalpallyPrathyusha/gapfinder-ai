/**
 * Authentication & Session Management
 * Built on `jose` for Edge/Serverless-compatible signed JWTs and `bcryptjs` for password hashing.
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET || "gapfinder-production-jwt-super-secret-key-32-chars-min";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "gapfinder_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "student" | "teacher";
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload: Omit<SessionPayload, "exp">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  // Only enforce secure cookies when explicitly running on HTTPS (e.g. Vercel production)
  const isHttps = process.env.VERCEL === "1" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
