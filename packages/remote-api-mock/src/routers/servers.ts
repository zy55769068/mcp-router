import { router, protectedProcedure } from "../trpc.js";
import {
  createServerSchema,
  updateServerSchema,
  deleteServerSchema,
} from "@mcp_router/remote-api-types";
import { z } from "zod";
import { serversStore } from "../data/servers.js";
import { logsStore } from "../data/logs.js";
import { TRPCError } from "@trpc/server";

export const serversRouter = router({
  list: protectedProcedure.query(() => {
    return serversStore.list();
  }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const server = serversStore.get(input.id);
      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Server with id ${input.id} not found`,
        });
      }
      return server;
    }),

  create: protectedProcedure.input(createServerSchema).mutation(({ input }) => {
    const server = serversStore.create(input.config);

    // Add some sample logs for the new server
    logsStore.addSampleLog(server.id, server.name, "success");

    return server;
  }),

  update: protectedProcedure.input(updateServerSchema).mutation(({ input }) => {
    const { id, config } = input;
    const server = serversStore.update(id, config);

    if (!server) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Server with id ${id} not found`,
      });
    }

    return server;
  }),

  delete: protectedProcedure.input(deleteServerSchema).mutation(({ input }) => {
    const success = serversStore.delete(input.id);

    if (!success) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Server with id ${input.id} not found`,
      });
    }

    // Also clear logs for this server
    logsStore.clear(input.id);

    return { success: true };
  }),

  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const server = serversStore.get(input.id);

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Server with id ${input.id} not found`,
        });
      }

      serversStore.start(input.id);

      // Add log entry
      logsStore.addSampleLog(input.id, server.name, "success");

      return { success: true };
    }),

  stop: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const server = serversStore.get(input.id);

      if (!server) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Server with id ${input.id} not found`,
        });
      }

      serversStore.stop(input.id);

      // Add log entry
      logsStore.addSampleLog(input.id, server.name, "success");

      return { success: true };
    }),

  getStatus: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const status = serversStore.getStatus(input.id);

      if (!status) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Server with id ${input.id} not found`,
        });
      }

      return { status };
    }),
});
