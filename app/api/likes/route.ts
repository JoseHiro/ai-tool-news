import { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { toggleLike, getUserLikes } from '@/lib/likes'
import { isSubscribed } from '@/lib/access'

async function requirePro(session: SessionData) {
  if (!session.userId) return false
  if (session.isAdmin) return true
  const user = await getUserById(session.userId)
  return isSubscribed(user ? getSubscribedUntil(user) : null)
}

export async function POST(req: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!(await requirePro(session))) {
    return Response.json({ error: 'プロプランが必要です' }, { status: 403 })
  }
  const { contentType, contentDate, contentKey, title } = await req.json()
  if (!contentType || !contentDate || !contentKey || !title) {
    return Response.json({ error: '必須パラメータが不足しています' }, { status: 400 })
  }
  const liked = await toggleLike(session.userId!, contentType, contentDate, contentKey, title)
  return Response.json({ liked })
}

export async function GET() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!(await requirePro(session))) {
    return Response.json({ error: 'プロプランが必要です' }, { status: 403 })
  }
  const likes = await getUserLikes(session.userId!)
  return Response.json({ likes })
}
