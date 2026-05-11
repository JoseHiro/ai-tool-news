import { getInput, saveInput } from '@/lib/storage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  if (!date) return Response.json({ error: 'date required' }, { status: 400 })

  const input = await getInput(date)
  return Response.json(input ?? { date, notes: [], updatedAt: '' })
}

export async function POST(request: Request) {
  const body = await request.json() as { date: string; notes: string[] }
  if (!body.date || !Array.isArray(body.notes)) {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  await saveInput({ date: body.date, notes: body.notes, updatedAt: new Date().toISOString() })
  return Response.json({ success: true })
}
