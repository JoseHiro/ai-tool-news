export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { isSubscribed } from '@/lib/access'
import { ManageSubscriptionButton } from '@/components/ManageSubscriptionButton'
import { SubscribeButton } from '@/components/SubscribeButton'

export const metadata: Metadata = {
  title: 'アカウント',
}

function formatDate(d: Date) {
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export default async function AccountPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) redirect('/login')

  const user = await getUserById(session.userId)
  if (!user) redirect('/api/auth/clear-session')

  const subscribedUntil = getSubscribedUntil(user)
  const active = isSubscribed(subscribedUntil)
  const hasStripeCustomer = !!user.stripe_customer_id

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-lg">
        <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
          Account
        </p>
        <h1 style={{ color: 'var(--text)' }} className="mb-8 text-2xl font-bold">
          アカウント
        </h1>

        {/* Profile */}
        <div
          style={{ border: '1px solid var(--border)' }}
          className="mb-4 rounded-xl px-5 py-4"
        >
          <p style={{ color: 'var(--text-muted)' }} className="mb-1 text-[10px] font-semibold uppercase tracking-widest">
            メールアドレス
          </p>
          <p style={{ color: 'var(--text)' }} className="text-sm">
            {user.email}
          </p>
        </div>

        {/* Subscription */}
        <div
          style={{ border: '1px solid var(--border)' }}
          className="mb-6 rounded-xl px-5 py-4"
        >
          <p style={{ color: 'var(--text-muted)' }} className="mb-3 text-[10px] font-semibold uppercase tracking-widest">
            プラン
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: 'var(--text)' }} className="text-sm font-semibold">
                {active ? 'プロプラン' : 'フリープラン'}
              </p>
              {active && subscribedUntil && (
                <p style={{ color: 'var(--text-muted)' }} className="mt-0.5 text-xs">
                  次回更新: {formatDate(subscribedUntil)}
                </p>
              )}
              {!active && (
                <p style={{ color: 'var(--text-muted)' }} className="mt-0.5 text-xs">
                  今日のダイジェストのみ閲覧可能
                </p>
              )}
            </div>

            <span
              style={{
                background: active ? 'var(--accent)' : 'var(--hover)',
                color: active ? '#fff' : 'var(--text-muted)',
              }}
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide"
            >
              {active ? 'Active' : 'Free'}
            </span>
          </div>
        </div>

        {/* Actions */}
        {active && hasStripeCustomer ? (
          <ManageSubscriptionButton />
        ) : (
          <SubscribeButton />
        )}

        <p style={{ color: 'var(--text-muted)' }} className="mt-4 text-[11px] leading-relaxed">
          {active
            ? 'プランの変更・解約は「プランを管理する」から行えます。'
            : 'プロプランに登録すると過去すべてのダイジェストと個人開発アイデア分析が閲覧できます。'}
        </p>
      </div>
    </div>
  )
}
