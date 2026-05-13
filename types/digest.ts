export interface Digest {
  date: string      // YYYY-MM-DD
  content: string   // Full markdown
  xPost: string     // X post text (~280 chars)
  createdAt: string // ISO timestamp
}

export interface DailyInput {
  date: string
  notes: string[]   // User-added raw notes / URLs
  updatedAt: string
}

export interface User {
  id: number
  email: string
  passwordHash: string
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  subscribedUntil: Date | null
  createdAt: Date
}

export type NewUser = Pick<User, 'email' | 'passwordHash'>