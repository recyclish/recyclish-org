export const onRequest = async (context: any) => {
    const { fetchRequestHandler } = await import("@trpc/server/adapters/fetch");
    const { edgeRouter } = await import("../../../server/edge-router");

    // Collect response headers (e.g. Set-Cookie from auth.login / auth.logout)
    const resHeaders = new Headers();

    const response = await fetchRequestHandler({
        endpoint: "/api/trpc",
        req: context.request,
        router: edgeRouter,
        createContext: () => ({
            env: context.env,
            req: context.request as Request,
            resHeaders,
        }),
    });

    // Merge any Set-Cookie headers from mutations into the response
    const mutableResponse = new Response(response.body, response);
    resHeaders.forEach((value, key) => {
        mutableResponse.headers.append(key, value);
    });

    return mutableResponse;
};
