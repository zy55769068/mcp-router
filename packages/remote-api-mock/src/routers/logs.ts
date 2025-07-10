import { router, protectedProcedure } from '../trpc.js'
import { logQueryOptionsSchema } from '@mcp_router/remote-api-types'
import { z } from 'zod'
import { logsStore } from '../data/logs.js'
import { TRPCError } from '@trpc/server'

export const logsRouter = router({
  list: protectedProcedure
    .input(logQueryOptionsSchema.optional())
    .query(({ input }) => {
      return logsStore.list(input || {})
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      const log = logsStore.get(input.id)
      
      if (!log) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Log with id ${input.id} not found`
        })
      }
      
      return log
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => {
      const success = logsStore.delete(input.id)
      
      if (!success) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Log with id ${input.id} not found`
        })
      }
      
      return { success: true }
    }),

  clear: protectedProcedure
    .input(z.object({ serverId: z.string().optional() }).optional())
    .mutation(({ input }) => {
      logsStore.clear(input?.serverId)
      return { success: true }
    })
})