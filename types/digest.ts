// ---- Structured digest types (JSON-based) ---------------------------------

export interface ClaudeDigest {
  date: string
  updates: {
    title: string
    body: string
    importance: 'high' | 'medium' | 'low'
    code?: { lang: string; code: string }
  }[]
  tips: {
    title: string
    description: string
    code?: { lang: string; code: string }
  }[]
  workflow: {
    title: string
    steps: { label: string; code?: string }[]
  }
  modelGuide: {
    model: string
    useCase: string
    cost: 'high' | 'medium' | 'low'
    when: string
  }[]
}

export interface IdeaDigest {
  date: string
  theme: string
  perspective: string
  ideas: {
    name: string
    emoji: string
    score: number
    overview: string
    platform: 'web' | 'mobile' | 'extension' | 'cli'
    direction: 'overseas-to-japan' | 'japan-to-overseas' | 'cheaper-alternative'
    market: { target: string; size: string; gap: string }
    revenue: { free: string; model: string; price: string }
    features: string[]
    aiUsage: string
    competitors: { name: string; threat: 'high' | 'medium' | 'low'; weakness: string }[]
    conclusion: string
    tags: string[]
  }[]
}

// ---- Legacy markdown-based types ------------------------------------------

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