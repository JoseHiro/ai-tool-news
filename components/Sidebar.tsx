import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDocDates } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { SidebarDateLink } from './SidebarDateLink'
import { ThemeToggle } from './ThemeToggle'
import { LogoutButton } from './LogoutButton'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function groupDates(dates: string[], today: string) {
  const todayGroup = dates.filter((d) => d === today)
  const weekGroup = dates.filter((d) => {
    if (d === today) return false
    return (new Date(today).getTime() - new Date(d).getTime()) / 86400000 <= 7
  })
  const olderGroup = dates.filter((d) => {
    if (d === today) return false
    return (new Date(today).getTime() - new Date(d).getTime()) / 86400000 > 7
  })
  return { todayGroup, weekGroup, olderGroup }
}

function SidebarSection({ label, dates, today }: { label: string; dates: string[]; today: string }) {
  if (!dates.length) return null
  return (
    <div className="mb-4">
      <p
        style={{ color: 'var(--text-muted)' }}
        className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest"
      >
        {label}
      </p>
      <div className="space-y-0.5">
        {dates.map((date) => (
          <SidebarDateLink key={date} date={date} isToday={date === today} />
        ))}
      </div>
    </div>
  )
}

export async function Sidebar() {
  const dates = await getDocDates()
  const today = todayJST()
  const { todayGroup, weekGroup, olderGroup } = groupDates(dates, today)
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isAuthed = !!session.userId

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      className="flex h-screen w-52 shrink-0 flex-col"
    >
      {/* Header */}
      <div className="px-4 py-5">
        <BrandMark variant="sidebar" />
        <p style={{ color: 'var(--text-muted)' }} className="mt-3 text-[11px]">
          開発者向けニュース
        </p>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-4 mb-3" />

      {/* Quick nav */}
      <div className="mb-3 space-y-0.5 px-1">
        <Link
          href="/guides"
          style={{ color: 'var(--text-muted)' }}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        >
          <span>📚</span>
          <span>ガイド</span>
        </Link>
        {isAuthed && (
          <Link
            href="/likes"
            style={{ color: 'var(--text-muted)' }}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
          >
            <span>♡</span>
            <span>いいかも</span>
          </Link>
        )}
        {isAuthed && (
          <Link
            href="/account"
            style={{ color: 'var(--text-muted)' }}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span>アカウント</span>
          </Link>
        )}
        <Link
          href="/ideas"
          style={{ color: 'var(--text-muted)' }}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        >
          <span>💡</span>
          <span>アイデア一覧</span>
        </Link>
        <Link
          href="/tips"
          style={{ color: 'var(--text-muted)' }}
          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        >
          <span>⚡</span>
          <span>Claude Tips</span>
        </Link>
      </div>

      <div style={{ borderTop: '1px solid var(--border)' }} className="mx-4 mb-3" />

      {/* Digest list */}
      <div className="flex-1 overflow-y-auto px-1 pb-2">
        {dates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }} className="px-3 text-xs">
            まだありません
          </p>
        ) : (
          <>
            <SidebarSection label="Today" dates={todayGroup} today={today} />
            <SidebarSection label="今週" dates={weekGroup} today={today} />
            <SidebarSection label="それ以前" dates={olderGroup} today={today} />
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {isAuthed ? (
              <LogoutButton email={session.email!} />
            ) : (
              <Link
                href="/login"
                style={{ color: 'var(--text-muted)' }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>ログイン</span>
              </Link>
            )}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
