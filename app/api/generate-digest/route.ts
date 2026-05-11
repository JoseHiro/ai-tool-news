import { generateDigest } from '@/lib/anthropic'
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

  const input = await getInput(date)
  const userNotes = input?.notes ?? []

  const digest = await generateDigest(date, userNotes)
  await saveDigest({ ...digest, createdAt: new Date().toISOString() })

  return Response.json({ success: true, date })
}
