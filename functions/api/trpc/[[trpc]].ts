import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { edgeRouter } from "../../../server/edge-router";

export const onRequest = async (context: any) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: context.request,
        router: edgeRouter,
        createContext: () => ({}),
    });
};
