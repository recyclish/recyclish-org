import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";

export interface EdgeContext {
    env?: Record<string, string>;
    // The raw Request object is needed so we can read cookies
    req?: Request;
    // A way to set response headers (cookies) from mutations
    resHeaders?: Headers;
}

const t = initTRPC.context<EdgeContext>().create({
    transformer: superjson,
});
export const router = t.router;
export const publicProcedure = t.procedure;

// Fallback hardcoded keys (will be overridden by env if present)
// Points to recyclish-directory project (ejtigzzdeblbwdpodgih)
const FALLBACK_URL = "https://ejtigzzdeblbwdpodgih.supabase.co";
const FALLBACK_KEY = ""; // Must be set via SUPABASE_ANON_KEY env var

const getSupabaseConfig = (ctx: EdgeContext) => ({
    url: ctx.env?.SUPABASE_URL || FALLBACK_URL,
    key: ctx.env?.SUPABASE_ANON_KEY || FALLBACK_KEY,
});

// ---------------------------------------------------------------------------
// Auth helpers (Web Crypto API — available in Cloudflare Workers)
// ---------------------------------------------------------------------------

async function sha256Hex(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function createJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const encode = (obj: unknown) =>
        btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const headerB64 = encode(header);
    const payloadB64 = encode(payload);
    const signingInput = `${headerB64}.${payloadB64}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    return `${signingInput}.${sigB64}`;
}

async function verifyJwt(token: string, secret: string): Promise<Record<string, unknown> | null> {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const [headerB64, payloadB64, sigB64] = parts;
        const signingInput = `${headerB64}.${payloadB64}`;
        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );
        // Restore base64 padding
        const pad = (s: string) => s + "=".repeat((4 - (s.length % 4)) % 4);
        const sigBytes = Uint8Array.from(atob(pad(sigB64.replace(/-/g, "+").replace(/_/g, "/"))), (c) =>
            c.charCodeAt(0)
        );
        const valid = await crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(signingInput));
        if (!valid) return null;
        const payload = JSON.parse(atob(pad(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}

function parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    for (const part of cookieHeader.split(";")) {
        const [k, ...v] = part.trim().split("=");
        if (k) cookies[k.trim()] = decodeURIComponent(v.join("="));
    }
    return cookies;
}

const COOKIE_NAME = "session";

export const edgeRouter = router({
    directory: router({
        search: publicProcedure
            .input(z.object({
                search: z.string().optional(),
                state: z.string().optional(),
                city: z.string().optional(),
                species: z.array(z.string()).optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                radius: z.number().optional(),
                limit: z.number().optional(),
                offset: z.number().optional(),
            }))
            .query(async ({ input, ctx }) => {
                const { url, key } = getSupabaseConfig(ctx);
                const response = await fetch(`${url}/rest/v1/rpc/search_shelters`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": key,
                        "Authorization": `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        p_lat: input.lat || null,
                        p_lng: input.lng || null,
                        p_radius_miles: input.radius || null,
                        p_search_text: input.search || null,
                        p_state_filter: input.state || null,
                        p_city_filter: input.city || null,
                        p_species_filter: input.species || null,
                        p_limit_count: input.limit || 50,
                        p_offset_count: input.offset || 0
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("[Edge DB] Search failed:", errorText);
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Search failed" });
                }

                return await response.json();
            }),

        list: publicProcedure
            .query(async ({ ctx }) => {
                const { url, key } = getSupabaseConfig(ctx);
                const response = await fetch(`${url}/rest/v1/shelters?active=eq.true&select=*&order=updated_at.desc`, {
                    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
                });
                if (!response.ok) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to list shelters" });
                return await response.json();
            }),

        stats: publicProcedure
            .query(async ({ ctx }) => {
                const { url, key } = getSupabaseConfig(ctx);
                const totalResp = await fetch(`${url}/rest/v1/shelters?active=eq.true&select=count`, {
                    headers: { "apikey": key, "Authorization": `Bearer ${key}`, "Prefer": "count=exact" }
                });

                const total = parseInt(totalResp.headers.get("content-range")?.split("/")?.[1] || "0");

                return {
                    total,
                    byState: [],
                    byCategory: []
                };
            }),

        getShelter: publicProcedure
            .input(z.object({ id: z.string().uuid() }))
            .query(async ({ input, ctx }) => {
                const { url, key } = getSupabaseConfig(ctx);
                const response = await fetch(`${url}/rest/v1/shelters?id=eq.${input.id}&select=*&limit=1`, {
                    headers: { "apikey": key, "Authorization": `Bearer ${key}` }
                });
                const data = await response.json();
                if (!data || data.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Shelter not found" });
                return data[0];
            }),
    }),

    auth: router({
        me: publicProcedure.query(async ({ ctx }) => {
            const jwtSecret = ctx.env?.JWT_SECRET;
            if (!jwtSecret) return null;
            const cookieHeader = ctx.req?.headers.get("cookie") || "";
            const cookies = parseCookies(cookieHeader);
            const token = cookies[COOKIE_NAME];
            if (!token) return null;
            const payload = await verifyJwt(token, jwtSecret);
            if (!payload) return null;
            return { id: payload.sub as string, role: payload.role as string, name: payload.name as string };
        }),

        login: publicProcedure
            .input(z.object({ email: z.string(), password: z.string() }))
            .mutation(async ({ input, ctx }) => {
                const adminEmail = ctx.env?.ADMIN_EMAIL;
                const adminPasswordHash = ctx.env?.ADMIN_PASSWORD_HASH;
                const jwtSecret = ctx.env?.JWT_SECRET;

                if (!adminEmail || !adminPasswordHash || !jwtSecret) {
                    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Auth not configured" });
                }

                // Verify email
                if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
                    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
                }

                // Verify password via SHA-256 hash
                const inputHash = await sha256Hex(input.password);
                if (inputHash !== adminPasswordHash.toLowerCase()) {
                    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
                }

                // Issue JWT (7-day expiry)
                const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
                const token = await createJwt(
                    { sub: "admin", role: "admin", name: "Admin", exp },
                    jwtSecret
                );

                // Set HttpOnly cookie via response headers
                const cookieValue = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
                if (ctx.resHeaders) {
                    ctx.resHeaders.append("Set-Cookie", cookieValue);
                }

                return { success: true as boolean };
            }),

        logout: publicProcedure.mutation(async ({ ctx }) => {
            const cookieValue = `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
            if (ctx.resHeaders) {
                ctx.resHeaders.append("Set-Cookie", cookieValue);
            }
            return { success: true as boolean };
        }),
    })
});

export type EdgeRouter = typeof edgeRouter;
