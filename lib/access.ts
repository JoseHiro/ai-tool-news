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

// Free tier: logged-in users can view today's digest without subscribing
export function canViewDate(
  session: SessionData,
  subscribedUntil: Date | null | undefined,
  date: string,
  today: string,
): boolean {
  if (!session.userId) return false
  if (session.isAdmin) return true
  if (isSubscribed(subscribedUntil)) return true
  return date === today
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
