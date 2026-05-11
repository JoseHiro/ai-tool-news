import { getDigest, getDigestDates } from '@/lib/storage'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (date) {
    const digest = await getDigest(date)
    if (!digest) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(digest)
  }

  const dates = await getDigestDates()
  return Response.json({ dates })
}
