import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { canViewContent } from '@/lib/access'
import { Paywall } from '@/components/Paywall'
import { readSearchIndex } from '@/lib/search-index'
import { IdeasClient } from './IdeasClient'

export default async function IdeasPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const user = session.userId ? await getUserById(session.userId) : null
  const subscribedUntil = user ? getSubscribedUntil(user) : null
  const canView = canViewContent(session, subscribedUntil)

  if (!canView) {
    return (
      <div className="px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">DevKnow</p>
          <h1 style={{ color: 'var(--text)' }} className="mb-8 text-2xl font-bold">個人開発アイデア</h1>
          <Paywall />
        </div>
      </div>
    )
  }

  const index = await readSearchIndex()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
          DevKnow
        </p>
        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
          個人開発アイデア
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm">
          過去の記事から抽出したアプリアイデア一覧。パターン・スコアで絞り込めます。
        </p>
        <IdeasClient ideas={index.ideas} />
      </div>
    </div>
  )
}
