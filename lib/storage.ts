import type { Digest, DailyInput } from '@/types/digest'

function getConnectionString(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    null
  )
}

const usePostgres = !!getConnectionString()

// ---- File-based storage (local dev only) ----------------------------------

async function getDataDir() {
  const { join } = await import('path')
  return join(process.cwd(), '.data')
}

async function readDb(): Promise<{ digests: Record<string, Digest>; inputs: Record<string, DailyInput> }> {
  const { promises: fs } = await import('fs')
  const dir = await getDataDir()
  try {
    const raw = await fs.readFile(`${dir}/db.json`, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { digests: {}, inputs: {} }
  }
}

async function writeDb(db: { digests: Record<string, Digest>; inputs: Record<string, DailyInput> }) {
  const { promises: fs } = await import('fs')
  const dir = await getDataDir()
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(`${dir}/db.json`, JSON.stringify(db, null, 2))
}

// ---- Postgres storage (production) ----------------------------------------

let tablesReady = false

async function getSql() {
  const { neon } = await import('@neondatabase/serverless')
  return neon(getConnectionString()!)
}

async function ensureTables() {
  if (tablesReady) return
  const sql = await getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS digests (
      date TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      x_post TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS inputs (
      date TEXT PRIMARY KEY,
      notes JSONB NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT ''
    )
  `
  tablesReady = true
}

// ---- Public API -----------------------------------------------------------

export async function getDigest(date: string): Promise<Digest | null> {
  if (!usePostgres) {
    const db = await readDb()
    return db.digests[date] ?? null
  }
  await ensureTables()
  const sql = await getSql()
  const rows = await sql`SELECT date, content, x_post, created_at FROM digests WHERE date = ${date}`
  if (rows.length === 0) return null
  const r = rows[0]
  return { date: r.date as string, content: r.content as string, xPost: r.x_post as string, createdAt: r.created_at as string }
}

export async function saveDigest(digest: Digest): Promise<void> {
  if (!usePostgres) {
    const db = await readDb()
    db.digests[digest.date] = digest
    await writeDb(db)
    return
  }
  await ensureTables()
  const sql = await getSql()
  await sql`
    INSERT INTO digests (date, content, x_post, created_at)
    VALUES (${digest.date}, ${digest.content}, ${digest.xPost}, ${digest.createdAt})
    ON CONFLICT (date) DO UPDATE SET content = EXCLUDED.content, x_post = EXCLUDED.x_post, created_at = EXCLUDED.created_at
  `
}

export async function getDigestDates(): Promise<string[]> {
  if (!usePostgres) {
    const db = await readDb()
    return Object.keys(db.digests).sort().reverse()
  }
  await ensureTables()
  const sql = await getSql()
  const rows = await sql`SELECT date FROM digests ORDER BY date DESC`
  return rows.map((r) => r.date as string)
}

export async function getInput(date: string): Promise<DailyInput | null> {
  if (!usePostgres) {
    const db = await readDb()
    return db.inputs[date] ?? null
  }
  await ensureTables()
  const sql = await getSql()
  const rows = await sql`SELECT date, notes, updated_at FROM inputs WHERE date = ${date}`
  if (rows.length === 0) return null
  const r = rows[0]
  return { date: r.date as string, notes: r.notes as string[], updatedAt: r.updated_at as string }
}

export async function saveInput(input: DailyInput): Promise<void> {
  if (!usePostgres) {
    const db = await readDb()
    db.inputs[input.date] = input
    await writeDb(db)
    return
  }
  await ensureTables()
  const sql = await getSql()
  await sql`
    INSERT INTO inputs (date, notes, updated_at)
    VALUES (${input.date}, ${JSON.stringify(input.notes)}, ${input.updatedAt})
    ON CONFLICT (date) DO UPDATE SET notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at
  `
}
