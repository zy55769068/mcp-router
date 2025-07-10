import { router } from "./trpc.js";
import { serversRouter } from "./routers/servers.js";
import { logsRouter } from "./routers/logs.js";
import type { RemoteAPIRouter } from "@mcp_router/remote-api-types";

export const appRouter = router({
  servers: serversRouter,
  logs: logsRouter,
}) satisfies RemoteAPIRouter;

export type AppRouter = typeof appRouter;
