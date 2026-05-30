import type { SuccessCase, SuccessCasesFile } from '@/types/digest'
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

let casesTableReady = false
let postgresAvailable: boolean | null = null
let sqlClient: ReturnType<typeof postgres> | null = null

function getSql() {
  if (!sqlClient) {
    sqlClient = postgres(getConnectionString()!, { ssl: 'require', max: 5 })
  }
  return sqlClient
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
  } catch {
    postgresAvailable = false
    return false
  }
}

function markUnavailable() {
  postgresAvailable = false
  casesTableReady = false
}

async function ensureTable() {
  if (casesTableReady) return
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS success_cases (
      date TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `
  casesTableReady = true
}

async function readCasesFile(date: string): Promise<SuccessCasesFile | null> {
  const { promises: fs } = await import('fs')
  const { join } = await import('path')
  const path = join(process.cwd(), 'public', 'data', 'cases', `${date}.json`)
  try {
    const raw = await fs.readFile(path, 'utf-8')
    return JSON.parse(raw) as SuccessCasesFile
  } catch {
    return null
  }
}

async function readAllCasesFiles(): Promise<SuccessCase[]> {
  const { promises: fs } = await import('fs')
  const { join } = await import('path')
  const dir = join(process.cwd(), 'public', 'data', 'cases')
  try {
    const files = await fs.readdir(dir)
    const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse()
    const all: SuccessCase[] = []
    for (const file of jsonFiles) {
      try {
        const raw = await fs.readFile(join(dir, file), 'utf-8')
        const parsed = JSON.parse(raw) as SuccessCasesFile
        all.push(...parsed.cases.map(c => ({ ...c, sourceDate: parsed.date })))
      } catch {
        // skip malformed files
      }
    }
    return all
  } catch {
    return []
  }
}

export async function getCasesForDate(date: string): Promise<SuccessCase[] | null> {
  if (await canUsePostgres()) {
    try {
      await ensureTable()
      const sql = getSql()
      const rows = await sql`SELECT data FROM success_cases WHERE date = ${date}`
      if (rows.length) return (rows[0].data as SuccessCasesFile).cases
    } catch (err) {
      markUnavailable()
    }
  }
  const file = await readCasesFile(date)
  return file?.cases ?? null
}

export async function getAllCases(): Promise<SuccessCase[]> {
  if (await canUsePostgres()) {
    try {
      await ensureTable()
      const sql = getSql()
      const rows = await sql`SELECT data FROM success_cases ORDER BY date DESC`
      return rows.flatMap(r => {
        const file = r.data as SuccessCasesFile
        return file.cases.map(c => ({ ...c, sourceDate: file.date }))
      })
    } catch (err) {
      markUnavailable()
    }
  }
  return readAllCasesFiles()
}

export async function saveCases(file: SuccessCasesFile): Promise<void> {
  if (await canUsePostgres()) {
    await ensureTable()
    const sql = getSql()
    await sql`
      INSERT INTO success_cases (date, data)
      VALUES (${file.date}, ${sql.json(file as never)})
      ON CONFLICT (date) DO UPDATE SET data = EXCLUDED.data
    `
    return
  }
  throw new Error('Postgres unavailable — cannot save success cases')
}
