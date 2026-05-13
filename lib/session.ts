import type { SessionOptions } from 'iron-session'

export interface SessionData {
  userId?: number
  email?: string
  isAdmin?: boolean
}

const secret = process.env.SESSION_SECRET ?? 'dev-only-secret-please-set-in-production!!'

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: 'digest-auth',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  },
}
