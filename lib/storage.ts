import type { Digest, DailyInput } from '@/types/digest'

// ---------------------------------------------------------------------------
// Storage abstraction: uses Vercel KV in production, file-based in local dev
// ---------------------------------------------------------------------------

function isValidKvConfig(): boolean {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token || token.length < 20) return false
  try {
    const { hostname } = new URL(url)
    return hostname.length > 4  // rejects placeholder "..."
  } catch {
    return false
  }
}

const useKV = isValidKvConfig()

// ---- File-based storage (local dev only) ----------------------------------

async function getDataDir() {
  const { join } = await import('path')
  return join(process.cwd(), '.data')
}

async function readDb(): Promise<{ digests: Record<string, Digest>; inputs: Record<string, DailyInput> }> {
  const { promises: fs } = await import('fs')
  const dir = await getDataDir()
  const file = `${dir}/db.json`
  try {
    const raw = await fs.readFile(file, 'utf-8')
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

// ---- Public API -----------------------------------------------------------

export async function getDigest(date: string): Promise<Digest | null> {
  if (useKV) {
    const { kv } = await import('@vercel/kv')
    return kv.get<Digest>(`digest:${date}`)
  }
  const db = await readDb()
  return db.digests[date] ?? null
}

export async function saveDigest(digest: Digest): Promise<void> {
  if (useKV) {
    const { kv } = await import('@vercel/kv')
    await kv.set(`digest:${digest.date}`, digest)
    await kv.zadd('digest:index', { score: new Date(digest.date).getTime(), member: digest.date })
    return
  }
  const db = await readDb()
  db.digests[digest.date] = digest
  await writeDb(db)
}

export async function getDigestDates(): Promise<string[]> {
  if (useKV) {
    const { kv } = await import('@vercel/kv')
    const dates = await kv.zrange<string[]>('digest:index', 0, -1, { rev: true })
    return dates
  }
  const db = await readDb()
  return Object.keys(db.digests).sort().reverse()
}

export async function getInput(date: string): Promise<DailyInput | null> {
  if (useKV) {
    const { kv } = await import('@vercel/kv')
    return kv.get<DailyInput>(`input:${date}`)
  }
  const db = await readDb()
  return db.inputs[date] ?? null
}

export async function saveInput(input: DailyInput): Promise<void> {
  if (useKV) {
    const { kv } = await import('@vercel/kv')
    await kv.set(`input:${input.date}`, input)
    return
  }
  const db = await readDb()
  db.inputs[input.date] = input
  await writeDb(db)
}
