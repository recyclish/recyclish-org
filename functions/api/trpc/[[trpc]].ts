import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../../server/routers";
import { createContext } from "../../../server/_core/context";

export const onRequest = async (context: any) => {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req: context.request,
        router: appRouter,
        createContext: () => createContext({ req: context.request, res: {} as any }),
    });
};
