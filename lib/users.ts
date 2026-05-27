export interface UserRow {
  id: number
  email: string
  password_hash: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscribed_until: string | null  // ISO string from DB
  created_at: string
}

import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null
function getSql() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING
  if (!url) throw new Error('DATABASE_URL not set')
  if (!_sql) _sql = postgres(url, { ssl: 'require', max: 5 })
  return _sql
}

async function ensureUsersTable() {
  const sql = getSql()
  // Create table with full schema for new databases
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id                     SERIAL PRIMARY KEY,
      email                  TEXT UNIQUE NOT NULL,
      password_hash          TEXT NOT NULL,
      stripe_customer_id     TEXT,
      stripe_subscription_id TEXT,
      subscribed_until       TIMESTAMPTZ,
      created_at             TIMESTAMPTZ DEFAULT now()
    )
  `
  // Add subscription columns to existing databases that only have old schema
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`
  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS subscribed_until TIMESTAMPTZ`
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password_hash, stripe_customer_id, stripe_subscription_id, subscribed_until, created_at
    FROM users WHERE email = ${email}
  `
  return (rows[0] as UserRow) ?? null
}

export async function getUserById(id: number): Promise<UserRow | null> {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password_hash, stripe_customer_id, stripe_subscription_id, subscribed_until, created_at
    FROM users WHERE id = ${id}
  `
  return (rows[0] as UserRow) ?? null
}

export async function createUser(email: string, passwordHash: string): Promise<void> {
  await ensureUsersTable()
  const sql = getSql()
  await sql`INSERT INTO users (email, password_hash) VALUES (${email}, ${passwordHash})`
}

export async function getUserCount(): Promise<number> {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`SELECT COUNT(*) as count FROM users`
  return parseInt(rows[0].count as string)
}

export async function updateSubscription(
  userId: number,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  subscribedUntil: Date,
): Promise<void> {
  const sql = getSql()
  await sql`
    UPDATE users
    SET stripe_customer_id     = ${stripeCustomerId},
        stripe_subscription_id = ${stripeSubscriptionId},
        subscribed_until       = ${subscribedUntil.toISOString()}
    WHERE id = ${userId}
  `
}

export function getSubscribedUntil(user: UserRow): Date | null {
  return user.subscribed_until ? new Date(user.subscribed_until) : null
}

export async function getUserByStripeCustomerId(customerId: string): Promise<UserRow | null> {
  const sql = getSql()
  const rows = await sql`
    SELECT id, email, password_hash, stripe_customer_id, stripe_subscription_id, subscribed_until, created_at
    FROM users WHERE stripe_customer_id = ${customerId}
  `
  return (rows[0] as UserRow) ?? null
}

export async function expireSubscription(userId: number): Promise<void> {
  const sql = getSql()
  await sql`UPDATE users SET subscribed_until = now() WHERE id = ${userId}`
}

// Creates admin user from env vars if DB is empty
export async function seedAdminIfNeeded(): Promise<void> {
  const count = await getUserCount()
  if (count > 0) return
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return
  const { hash } = await import('bcryptjs')
  const passwordHash = await hash(password, 10)
  await createUser(email, passwordHash)
}
