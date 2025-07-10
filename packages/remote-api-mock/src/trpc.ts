import { initTRPC } from '@trpc/server'
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express'

export const createContext = async ({ req }: CreateExpressContextOptions) => {
  // Extract token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '')
  
  return {
    token,
    req
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

// Auth middleware that checks for valid token
export const authMiddleware = middleware(async ({ ctx, next }) => {
  if (!ctx.token) {
    throw new Error('Unauthorized: No token provided')
  }
  
  // In a real implementation, validate the token
  // For mock server, we'll accept any non-empty token
  if (ctx.token !== 'mock-token') {
    throw new Error('Unauthorized: Invalid token')
  }
  
  return next({
    ctx: {
      ...ctx,
      isAuthenticated: true
    }
  })
})

export const protectedProcedure = publicProcedure.use(authMiddleware)