import Link from 'next/link'
import { BRAND_SUBLINE, BRAND_TAGLINE } from '@/lib/brand'
import { BrandMark } from '@/components/BrandMark'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDocDates } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { SidebarNav } from './SidebarNav'
import { SidebarMonthGroup } from './SidebarMonthGroup'
import { ThemeToggle } from './ThemeToggle'
import { LogoutButton } from './LogoutButton'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function groupByMonth(dates: string[]): { ym: string; dates: string[] }[] {
  const map = new Map<string, string[]>()
  for (const d of dates) {
    const ym = d.slice(0, 7)
    if (!map.has(ym)) map.set(ym, [])
    map.get(ym)!.push(d)
  }
  return Array.from(map.entries()).map(([ym, ds]) => ({ ym, dates: ds }))
}

export async function Sidebar() {
  const dates = await getDocDates()
  const today = todayJST()
  const months = groupByMonth(dates)
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isAuthed = !!session.userId

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)' }}
      className="flex h-screen w-52 shrink-0 flex-col"
    >
      <div className="px-4 py-5">
        <BrandMark variant="sidebar" />
        <p style={{ color: 'var(--text-muted)' }} className="mt-2 text-[11px] leading-snug">
          {BRAND_SUBLINE}
        </p>
      </div>

      <div className="mb-2">
        <SidebarNav isAuthed={isAuthed} />
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-4 mb-2" />

      <div className="flex-1 overflow-y-auto px-1 pb-2">
        <p
          style={{ color: 'var(--text-muted)' }}
          className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
        >
          アーカイブ
        </p>
        {dates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }} className="px-3 text-xs">
            まだありません
          </p>
        ) : (
          <div className="space-y-0.5">
            {months.map(({ ym, dates: ds }) => (
              <SidebarMonthGroup key={ym} ym={ym} dates={ds} today={today} />
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-3 py-4">
        <p style={{ color: 'var(--text)' }} className="mb-1 text-xs font-semibold">
          DevKnowとは？
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="mb-2.5 text-[11px] leading-relaxed">
          {BRAND_TAGLINE}
        </p>
        <Link
          href="/about"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="inline-block rounded-md px-3 py-1 text-[11px] font-medium transition-opacity hover:opacity-70"
        >
          詳しく見る
        </Link>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {isAuthed && <LogoutButton email={session.email!} />}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
