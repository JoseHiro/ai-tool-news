import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById } from '@/lib/users'
import { getStripe, getBaseUrl } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const user = await getUserById(session.userId)
  if (!user?.stripe_customer_id) {
    return Response.json({ error: 'サブスクリプションが見つかりません' }, { status: 400 })
  }

  const base = getBaseUrl(req)
  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${base}/account`,
  })

  return Response.json({ url: portalSession.url })
}
