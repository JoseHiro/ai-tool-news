// LLM generation disabled — content comes from public/docs/claude/ and public/docs/ideas/
// import { generateDigest } from '@/lib/anthropic'
// import { fetchArticles } from '@/lib/feeds'
// import { getInput, saveDigest } from '@/lib/storage'

export async function GET() {
  return Response.json({ ok: true, message: 'LLM generation disabled' })
}

export async function POST() {
  return Response.json({ ok: true, message: 'LLM generation disabled' })
}
