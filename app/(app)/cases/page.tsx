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
  const jstNow = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const today = jstNow.toISOString().slice(0, 10)
  const hasNew = cases.some(c => c.sourceDate === today)

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-base">🚩</span>
            <h1 style={{ color: 'var(--text)' }} className="text-xl font-bold">
              個人開発アプリ成功事例
            </h1>
            {hasNew && (
              <span
                style={{ background: '#8b5cf6', color: '#fff' }}
                className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
              >
                NEW
              </span>
            )}
            <span style={{ color: 'var(--text-muted)' }} className="ml-auto flex items-center gap-1 text-xs">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {today.replace(/-/g, '年').replace(/年(\d{2})年/, '年$1月').replace(/(\d{2})$/, '$1日')} 時点
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            海外・国内の開発者による個人開発アプリの成功事例を日次でピックアップ。アイデアのヒントに。
          </p>
        </div>
        <CasesClient cases={cases} today={today} />
      </div>
    </div>
  )
}
