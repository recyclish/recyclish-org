import { initTRPC } from "@trpc/server";
import { z } from "zod";

const t = initTRPC.create();
export const router = t.router;
export const publicProcedure = t.procedure;

const SUPABASE_URL = "https://vraafuuipvxfxygkuvau.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc20iOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIiwiZXhwIjoyMDgwNjY2MzA4fQ.InZyYWF1dWlwdnhmeHlna3V2YXVfYW5vbiI";

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
            .query(async ({ input }) => {
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/search_shelters`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_ANON_KEY,
                        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
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
                    throw new Error("Search failed");
                }

                return await response.json();
            }),
    }),
    auth: router({
        me: publicProcedure.query(() => null), // Mock auth for now
    })
});

export type EdgeRouter = typeof edgeRouter;
