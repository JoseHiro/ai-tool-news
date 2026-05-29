import type { Metadata } from 'next'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { canViewContent } from '@/lib/access'
import { Paywall } from '@/components/Paywall'
import { getAllCases } from '@/lib/cases'
import { CasesClient } from './CasesClient'

export const metadata: Metadata = {
  title: '成功事例 | DevKnow',
  description: 'Grok B リサーチで発掘した個人開発の成功事例。MRR・DL数・売上を公開している実在の事例を収録。',
}

export default async function CasesPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const user = session.userId ? await getUserById(session.userId) : null
  const subscribedUntil = user ? getSubscribedUntil(user) : null
  const canView = canViewContent(session, subscribedUntil)

  if (!canView) {
    return (
      <div className="px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">DevKnow</p>
          <h1 style={{ color: 'var(--text)' }} className="mb-8 text-2xl font-bold">成功事例</h1>
          <Paywall />
        </div>
      </div>
    )
  }

  const cases = await getAllCases()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-5xl">
        <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
          DevKnow
        </p>
        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
          成功事例
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm">
          個人開発者が MRR・DL数・売上を公開している実在の成功事例。アイデアの参考市場として活用できます。
        </p>
        <CasesClient cases={cases} />
      </div>
    </div>
  )
}
