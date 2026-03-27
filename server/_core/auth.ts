/**
 * Self-contained admin authentication for recyclish.info
 *
 * Replaces Manus OAuth with a simple email + password login that issues
 * a JWT session cookie. No external auth provider required.
 *
 * Environment variables required:
 *   ADMIN_EMAIL         - The admin's email address
 *   ADMIN_PASSWORD_HASH - SHA-256 hex hash of the admin password
 *   JWT_SECRET          - Secret key for signing session JWTs (32+ chars)
 *
 * To generate ADMIN_PASSWORD_HASH:
 *   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('yourpassword').digest('hex'))"
 */

import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "crypto";
import type { Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const ADMIN_OPEN_ID = "admin-local";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) {
    console.warn("[Auth] JWT_SECRET is not set — sessions will not persist across restarts");
  }
  // Pad short secrets to at least 32 bytes
  const padded = secret.padEnd(32, "x");
  return new TextEncoder().encode(padded);
}

function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
}

function getAdminPasswordHash(): string {
  return (process.env.ADMIN_PASSWORD_HASH ?? "").toLowerCase().trim();
}

/**
 * Verify a plain-text password against the stored SHA-256 hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(plaintext: string): boolean {
  const storedHash = getAdminPasswordHash();
  if (!storedHash) return false;
  const inputHash = createHash("sha256").update(plaintext).digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(inputHash, "utf8"),
      Buffer.from(storedHash, "utf8")
    );
  } catch {
    return false;
  }
}

/**
 * Verify email + password credentials.
 */
export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = getAdminEmail();
  if (!adminEmail) return false;
  if (email.toLowerCase().trim() !== adminEmail) return false;
  return verifyPassword(password);
}

/**
 * Create a signed JWT session token for the admin user.
 */
export async function createAdminSession(): Promise<string> {
  const secret = getJwtSecret();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({
    openId: ADMIN_OPEN_ID,
    appId: "recyclish-info",
    name: "Admin",
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret);
}

/**
 * Verify a session cookie and return the session payload, or null if invalid.
 */
export async function verifySession(
  cookieValue: string | undefined | null
): Promise<{ openId: string; appId: string; name: string; role: string } | null> {
  if (!cookieValue) return null;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(cookieValue, secret, {
      algorithms: ["HS256"],
    });
    const { openId, appId, name, role } = payload as Record<string, unknown>;
    if (
      typeof openId !== "string" || !openId ||
      typeof appId !== "string" || !appId ||
      typeof name !== "string" || !name
    ) {
      return null;
    }
    return {
      openId,
      appId,
      name,
      role: typeof role === "string" ? role : "user",
    };
  } catch {
    return null;
  }
}

/**
 * Parse cookies from a request header string.
 */
export function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  const result = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) result.set(key.trim(), decodeURIComponent(rest.join("=")));
  }
  return result;
}

/**
 * Authenticate a request by reading the session cookie.
 * Returns the admin User object if valid, or null.
 */
export async function authenticateRequest(req: Request): Promise<{
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: string;
  loginMethod: string | null;
  lastSignedIn: string | null;
  createdAt: string | null;
  updatedAt: string | null;
} | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionCookie);
  if (!session) return null;

  // Return a synthetic user object for the admin
  return {
    id: 1,
    openId: session.openId,
    name: session.name,
    email: getAdminEmail() || null,
    role: session.role,
    loginMethod: "password",
    lastSignedIn: new Date().toISOString(),
    createdAt: null,
    updatedAt: null,
  };
}
