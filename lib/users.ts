function getSql() {
  const { neon } = require('@neondatabase/serverless')
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

async function ensureUsersTable() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `
}

export async function findUserByEmail(email: string) {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`
  return rows[0] ?? null
}

export async function getUserById(id: number) {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`SELECT id, email FROM users WHERE id = ${id}`
  return rows[0] ?? null
}

export async function createUser(email: string, passwordHash: string) {
  await ensureUsersTable()
  const sql = getSql()
  await sql`INSERT INTO users (email, password_hash, created_at) VALUES (${email}, ${passwordHash}, ${new Date().toISOString()})`
}

export async function getUserCount() {
  await ensureUsersTable()
  const sql = getSql()
  const rows = await sql`SELECT COUNT(*) as count FROM users`
  return parseInt(rows[0].count as string)
}

// Creates admin user from env vars if DB is empty
export async function seedAdminIfNeeded() {
  const count = await getUserCount()
  if (count > 0) return
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) return
  const { hash } = await import('bcryptjs')
  const passwordHash = await hash(password, 10)
  await createUser(email, passwordHash)
}
