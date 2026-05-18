import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { toggleLike, getUserLikes } from '@/lib/likes'

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }
  const { contentType, contentDate, contentKey, title } = await req.json()
  if (!contentType || !contentDate || !contentKey || !title) {
    return Response.json({ error: '必須パラメータが不足しています' }, { status: 400 })
  }
  const liked = await toggleLike(session.userId, contentType, contentDate, contentKey, title)
  return Response.json({ liked })
}

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }
  const likes = await getUserLikes(session.userId)
  return Response.json({ likes })
}
