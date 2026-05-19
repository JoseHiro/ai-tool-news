export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { updateSubscription } from '@/lib/users'
import { sessionOptions, type SessionData } from '@/lib/session'

export default async function StripeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.userId) redirect('/login')

  // Verify payment and update DB directly — webhook may not have fired yet
  if (session_id) {
    try {
      const checkoutSession = await getStripe().checkout.sessions.retrieve(session_id, {
        expand: ['subscription', 'subscription.items'],
      })

      if (
        checkoutSession.payment_status === 'paid' &&
        checkoutSession.mode === 'subscription' &&
        checkoutSession.metadata?.userId
      ) {
        const userId = parseInt(checkoutSession.metadata.userId)
        const sub = checkoutSession.subscription as Stripe.Subscription
        const periodEnd =
          sub?.items?.data[0]?.current_period_end ??
          Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

        await updateSubscription(
          userId,
          checkoutSession.customer as string,
          sub.id,
          new Date(periodEnd * 1000),
        )
      }
    } catch (e) {
      console.error('[stripe/success] verification failed:', e)
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="w-full max-w-sm text-center">
        <div
          style={{ background: 'var(--hover)' }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--accent)' }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-xl font-bold">
          サブスクリプション完了！
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm leading-relaxed">
          ご登録ありがとうございます。
          <br />
          すべてのコンテンツが閲覧できるようになりました。
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          コンテンツを読む
        </Link>
      </div>
    </div>
  )
}
