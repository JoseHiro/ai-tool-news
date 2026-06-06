import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getStripe, getBaseUrl } from '@/lib/stripe'

export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId || !session.email) {
    return Response.json({ error: 'ログインが必要です' }, { status: 401 })
  }

  const priceId = process.env.NODE_ENV === 'development'
    ? (process.env.STRIPE_TEST_PRICE_ID ?? process.env.STRIPE_PRICE_ID)
    : process.env.STRIPE_PRICE_ID
  if (!priceId) {
    return Response.json({ error: 'Stripe が設定されていません' }, { status: 500 })
  }

  const base = getBaseUrl(req)

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/`,
    metadata: { userId: session.userId.toString() },
  })

  return Response.json({ url: checkoutSession.url })
}
