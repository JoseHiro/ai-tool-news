import { generateDigest } from '@/lib/anthropic'
import { fetchArticles } from '@/lib/feeds'
import { getInput, saveDigest } from '@/lib/storage'

// Called by Vercel Cron (GET) or manual dashboard button (POST)
export async function GET() {
  return run()
}

export async function POST() {
  return run()
}

async function run() {
  // Use JST date (UTC+9)
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const date = now.toISOString().slice(0, 10)

  const [input, articles] = await Promise.all([getInput(date), fetchArticles()])
  const userNotes = input?.notes ?? []

  const digest = await generateDigest(date, userNotes, articles)
  await saveDigest({ ...digest, createdAt: new Date().toISOString() })

  return Response.json({ success: true, date })
}
