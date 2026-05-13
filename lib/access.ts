import type { SessionData } from './session'

export type AccessLevel = 'admin' | 'subscriber' | 'free'

export function isAdmin(email: string | undefined): boolean {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!email || !adminEmail) return false
  return email.toLowerCase() === adminEmail.toLowerCase()
}

export function isSubscribed(subscribedUntil: Date | null | undefined): boolean {
  return !!subscribedUntil && subscribedUntil > new Date()
}

export function canViewContent(
  session: SessionData,
  subscribedUntil?: Date | null,
): boolean {
  if (!session.userId) return false
  if (session.isAdmin) return true
  return isSubscribed(subscribedUntil)
}

export function getAccessLevel(
  session: SessionData,
  subscribedUntil?: Date | null,
): AccessLevel {
  if (!session.userId) return 'free'
  if (session.isAdmin) return 'admin'
  if (isSubscribed(subscribedUntil)) return 'subscriber'
  return 'free'
}
