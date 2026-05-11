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
