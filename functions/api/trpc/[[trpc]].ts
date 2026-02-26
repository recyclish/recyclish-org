export const onRequest = async (context: any) => {
    const { fetchRequestHandler } = await import("@trpc/server/adapters/fetch");
    const { edgeRouter } = await import("../../../server/edge-router");

    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: context.request,
        router: edgeRouter,
        createContext: () => ({ env: context.env }),
    });
};
