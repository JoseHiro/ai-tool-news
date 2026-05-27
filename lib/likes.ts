import postgres from 'postgres'

let _sql: ReturnType<typeof postgres> | null = null
function getSql() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING
  if (!url) throw new Error('DATABASE_URL not set')
  if (!_sql) _sql = postgres(url, { ssl: 'require', max: 5 })
  return _sql
}

async function ensureLikesTable() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      content_type TEXT NOT NULL,
      content_date TEXT NOT NULL,
      content_key TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, content_type, content_date, content_key)
    )
  `
}

export type LikeEntry = {
  id: number
  content_type: 'idea' | 'tip'
  content_date: string
  content_key: string
  title: string
  created_at: string
}

export async function getUserLikedKeys(userId: number): Promise<Set<string>> {
  await ensureLikesTable()
  const sql = getSql()
  const rows = await sql`
    SELECT content_type, content_date, content_key FROM likes WHERE user_id = ${userId}
  `
  return new Set((rows as unknown as { content_type: string; content_date: string; content_key: string }[]).map(r =>
    `${r.content_type}:${r.content_date}:${r.content_key}`
  ))
}

export async function getUserLikes(userId: number): Promise<LikeEntry[]> {
  await ensureLikesTable()
  const sql = getSql()
  const rows = await sql`
    SELECT id, content_type, content_date, content_key, title, created_at
    FROM likes
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
  return rows as unknown as LikeEntry[]
}

export type PopularTopic = { title: string; likeCount: number }

export async function getWeeklyTopLiked(limit = 5, contentType?: 'tip' | 'idea'): Promise<PopularTopic[]> {
  await ensureLikesTable()
  const sql = getSql()
  const rows = contentType
    ? await sql`
        SELECT title, COUNT(*)::int AS like_count
        FROM likes
        WHERE created_at >= NOW() - INTERVAL '7 days'
          AND content_type = ${contentType}
        GROUP BY title
        ORDER BY like_count DESC
        LIMIT ${limit}
      `
    : await sql`
        SELECT title, COUNT(*)::int AS like_count
        FROM likes
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY title
        ORDER BY like_count DESC
        LIMIT ${limit}
      `
  return (rows as unknown as { title: string; like_count: number }[]).map(r => ({
    title: r.title,
    likeCount: r.like_count,
  }))
}

export async function toggleLike(
  userId: number,
  contentType: string,
  contentDate: string,
  contentKey: string,
  title: string,
): Promise<boolean> {
  await ensureLikesTable()
  const sql = getSql()
  const existing = await sql`
    SELECT id FROM likes
    WHERE user_id = ${userId}
      AND content_type = ${contentType}
      AND content_date = ${contentDate}
      AND content_key = ${contentKey}
  `
  if (existing.length > 0) {
    await sql`
      DELETE FROM likes
      WHERE user_id = ${userId}
        AND content_type = ${contentType}
        AND content_date = ${contentDate}
        AND content_key = ${contentKey}
    `
    return false
  } else {
    await sql`
      INSERT INTO likes (user_id, content_type, content_date, content_key, title)
      VALUES (${userId}, ${contentType}, ${contentDate}, ${contentKey}, ${title})
    `
    return true
  }
}
