import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/index.js'
import * as schema from '../db/schema/index.js'
import { ensureWorkspaceForNewUser } from '../db/bootstrap.js'

const secret = process.env.BETTER_AUTH_SECRET || process.env.SESSION_SECRET
const baseURL = process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3070}`
const appURL = process.env.APP_URL || 'http://localhost:5173'
const enableSignup = process.env.ENABLE_SIGNUP !== 'false'

if (!secret || secret.length < 32) {
  console.warn(
    'Warning: BETTER_AUTH_SECRET should be at least 32 characters. Generate with: openssl rand -base64 32',
  )
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: secret || 'development-only-secret-change-before-production-32chars',
  baseURL,
  trustedOrigins: [appURL, baseURL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: !enableSignup,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await ensureWorkspaceForNewUser(user.id, user.name)
        },
      },
    },
  },
})
