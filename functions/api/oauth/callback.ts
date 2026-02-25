import { COOKIE_NAME, ONE_YEAR_MS } from "../../../shared/const";
import * as db from "../../../server/db";
import { sdk } from "../../../server/_core/sdk";

export const onRequest = async (context: any) => {
    const url = new URL(context.request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (!code || !state) {
        return new Response(JSON.stringify({ error: "code and state are required" }), { status: 400 });
    }

    try {
        const tokenResponse = await sdk.exchangeCodeForToken(code, state);
        const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

        if (!userInfo.openId) {
            return new Response(JSON.stringify({ error: "openId missing from user info" }), { status: 400 });
        }

        await db.upsertUser({
            openId: userInfo.openId,
            name: userInfo.name || null,
            email: userInfo.email ?? null,
            loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
            lastSignedIn: new Date(),
        });

        const sessionToken = await sdk.createSessionToken(userInfo.openId, {
            name: userInfo.name || "",
            expiresInMs: ONE_YEAR_MS,
        });

        // We can't use res.cookie in Workers easily without a library, but we can set the header manually
        const response = new Response(null, {
            status: 302,
            headers: {
                "Location": "/",
                "Set-Cookie": `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${ONE_YEAR_MS / 1000}; HttpOnly; SameSite=Lax`
            }
        });

        return response;
    } catch (error) {
        console.error("[OAuth] Callback failed", error);
        return new Response(JSON.stringify({ error: "OAuth callback failed" }), { status: 500 });
    }
};
