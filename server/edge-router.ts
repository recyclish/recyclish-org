import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";

export interface EdgeContext {
    env?: Record<string, string>;
}

const t = initTRPC.context<EdgeContext>().create();
export const router = t.router;
export const publicProcedure = t.procedure;

// Fallback hardcoded keys (will be overridden by env if present)
const FALLBACK_URL = "https://vraafuuipvxfxygkuvau.supabase.co";
const FALLBACK_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYWFmdXVpcHZ4Znh5Z2t1dmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MjY3MTAsImV4cCI6MjA1NjEwMjcxMH0.R_H2p59Njk1Njk2RnN0.dwvK-IA-zHOJRx78bSDbTmYky6l3YOfQgKVasmFLOHg";

const getSupabaseConfig = (ctx: EdgeContext) => ({
    url: ctx.env?.SUPABASE_URL || FALLBACK_URL,
    key: ctx.env?.SUPABASE_ANON_KEY || FALLBACK_KEY,
});

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
                // Execute multiple count queries via a single batch or separate fetches
                const totalResp = await fetch(`${url}/rest/v1/shelters?active=eq.true&select=count`, {
                    headers: { "apikey": key, "Authorization": `Bearer ${key}`, "Prefer": "count=exact" }
                });

                // Simplified stats for edge performance
                const total = parseInt(totalResp.headers.get("content-range")?.split("/")?.[1] || "0");

                return {
                    total,
                    byState: [], // Hydrate these as needed or use a custom RPC
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
        me: publicProcedure.query(() => null),
    })
});

export type EdgeRouter = typeof edgeRouter;
