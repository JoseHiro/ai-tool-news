import type { Digest, DailyInput, ClaudeDigest, IdeaDigest } from '@/types/digest'
import postgres from 'postgres'

function getConnectionString(): string | null {
  return (
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.POSTGRES_URL_NON_POOLING ??
    null
  )
}

const hasPostgresUrl = !!getConnectionString()

// ---- File-based storage (local dev fallback) ------------------------------

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
let postgresAvailable: boolean | null = null
let sqlClient: ReturnType<typeof postgres> | null = null

function getSql() {
  if (!sqlClient) {
    sqlClient = postgres(getConnectionString()!, { ssl: 'require', max: 5 })
  }
  return sqlClient
}

function warnPostgresFallback(err: unknown) {
  if (process.env.NODE_ENV !== 'development') return
  const msg = err instanceof Error ? err.message : String(err)
  console.warn(`[storage] Postgres unavailable, using .data file storage: ${msg}`)
}

async function canUsePostgres(): Promise<boolean> {
  if (!hasPostgresUrl) return false
  if (postgresAvailable === false) return false
  if (postgresAvailable === true) return true
  try {
    const sql = getSql()
    await sql`SELECT 1`
    postgresAvailable = true
    return true
  } catch (err) {
    postgresAvailable = false
    tablesReady = false
    warnPostgresFallback(err)
    return false
  }
}

function markPostgresUnavailable(err: unknown) {
  postgresAvailable = false
  tablesReady = false
  warnPostgresFallback(err)
}

async function ensureTables() {
  if (tablesReady) return
  const sql = getSql()
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
  await sql`
    CREATE TABLE IF NOT EXISTS claude_digests (
      date TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS idea_digests (
      date TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  tablesReady = true
}

// ---- Public API -----------------------------------------------------------

export async function getDigest(date: string): Promise<Digest | null> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`SELECT date, content, x_post, created_at FROM digests WHERE date = ${date}`
      if (rows.length === 0) return null
      const r = rows[0]
      return {
        date: r.date as string,
        content: r.content as string,
        xPost: r.x_post as string,
        createdAt: r.created_at as string,
      }
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  const db = await readDb()
  return db.digests[date] ?? null
}

export async function saveDigest(digest: Digest): Promise<void> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      await sql`
        INSERT INTO digests (date, content, x_post, created_at)
        VALUES (${digest.date}, ${digest.content}, ${digest.xPost}, ${digest.createdAt})
        ON CONFLICT (date) DO UPDATE SET content = EXCLUDED.content, x_post = EXCLUDED.x_post, created_at = EXCLUDED.created_at
      `
      return
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  const db = await readDb()
  db.digests[digest.date] = digest
  await writeDb(db)
}

export async function getDigestDates(): Promise<string[]> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`SELECT date FROM digests ORDER BY date DESC`
      return rows.map((r) => r.date as string)
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  const db = await readDb()
  return Object.keys(db.digests).sort().reverse()
}

export async function getInput(date: string): Promise<DailyInput | null> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`SELECT date, notes, updated_at FROM inputs WHERE date = ${date}`
      if (rows.length === 0) return null
      const r = rows[0]
      return { date: r.date as string, notes: r.notes as string[], updatedAt: r.updated_at as string }
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  const db = await readDb()
  return db.inputs[date] ?? null
}

export async function saveInput(input: DailyInput): Promise<void> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      await sql`
        INSERT INTO inputs (date, notes, updated_at)
        VALUES (${input.date}, ${JSON.stringify(input.notes)}, ${input.updatedAt})
        ON CONFLICT (date) DO UPDATE SET notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at
      `
      return
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  const db = await readDb()
  db.inputs[input.date] = input
  await writeDb(db)
}

// ---- Structured JSON digest storage ---------------------------------------

async function readDataFile<T>(type: 'claude' | 'ideas', date: string): Promise<T | null> {
  const { promises: fs } = await import('fs')
  const { join } = await import('path')
  const path = join(process.cwd(), 'public', 'data', type, `${date}.json`)
  try {
    const raw = await fs.readFile(path, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function getClaudeDigest(date: string): Promise<ClaudeDigest | null> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`SELECT data FROM claude_digests WHERE date = ${date}`
      if (rows.length) return rows[0].data as ClaudeDigest
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  return readDataFile<ClaudeDigest>('claude', date)
}

export async function saveClaudeDigest(digest: ClaudeDigest): Promise<void> {
  if (await canUsePostgres()) {
    await ensureTables()
    const sql = getSql()
    await sql`
      INSERT INTO claude_digests (date, data)
      VALUES (${digest.date}, ${sql.json(digest as never)})
      ON CONFLICT (date) DO UPDATE SET data = EXCLUDED.data
    `
    return
  }
  throw new Error('Postgres unavailable — cannot save structured digest')
}

export async function getIdeaDigest(date: string): Promise<IdeaDigest | null> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`SELECT data FROM idea_digests WHERE date = ${date}`
      if (rows.length) return rows[0].data as IdeaDigest
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  return readDataFile<IdeaDigest>('ideas', date)
}

export async function saveIdeaDigest(digest: IdeaDigest): Promise<void> {
  if (await canUsePostgres()) {
    await ensureTables()
    const sql = getSql()
    await sql`
      INSERT INTO idea_digests (date, data)
      VALUES (${digest.date}, ${sql.json(digest as never)})
      ON CONFLICT (date) DO UPDATE SET data = EXCLUDED.data
    `
    return
  }
  throw new Error('Postgres unavailable — cannot save structured digest')
}

export async function getStructuredDigestDates(): Promise<string[]> {
  if (await canUsePostgres()) {
    try {
      await ensureTables()
      const sql = getSql()
      const rows = await sql`
        SELECT date FROM claude_digests
        UNION
        SELECT date FROM idea_digests
        ORDER BY date DESC
      `
      return rows.map(r => r.date as string)
    } catch (err) {
      markPostgresUnavailable(err)
    }
  }
  return []
}
