import { router } from "./trpc.js";
import { serversRouter } from "./routers/servers.js";
import { logsRouter } from "./routers/logs.js";

export const appRouter = router({
  servers: serversRouter,
  logs: logsRouter,
});

export type AppRouter = typeof appRouter;
