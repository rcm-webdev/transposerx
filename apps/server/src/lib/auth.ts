import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma.js'

const secret = process.env.BETTER_AUTH_SECRET
if (!secret) throw new Error('BETTER_AUTH_SECRET env var is required')

if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_ORIGIN) {
  throw new Error('CLIENT_ORIGIN env var is required in production')
}
const trustedOrigins = [process.env.CLIENT_ORIGIN ?? 'http://localhost:5173']

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  secret,
  rateLimit: {
    enabled: true,
    storage: 'database',
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        return new Response(
          JSON.stringify({ message: 'Registration is currently closed.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }),
  },
})
