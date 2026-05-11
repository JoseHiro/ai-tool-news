import Link from 'next/link'
import { getDigestDates } from '@/lib/storage'
import { SidebarDateLink } from './SidebarDateLink'
import { GenerateButton } from './GenerateButton'
import { ThemeToggle } from './ThemeToggle'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function groupDates(dates: string[], today: string) {
  const todayGroup = dates.filter((d) => d === today)
  const weekGroup = dates.filter((d) => {
    if (d === today) return false
    const diff = (new Date(today).getTime() - new Date(d).getTime()) / 86400000
    return diff <= 7
  })
  const olderGroup = dates.filter((d) => {
    if (d === today) return false
    const diff = (new Date(today).getTime() - new Date(d).getTime()) / 86400000
    return diff > 7
  })
  return { todayGroup, weekGroup, olderGroup }
}

function SidebarGroup({ label, dates, today }: { label: string; dates: string[]; today: string }) {
  if (!dates.length) return null
  return (
    <div className="mb-3">
      <p style={{ color: 'var(--text-muted)' }} className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider">
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
  const dates = await getDigestDates()
  const today = todayJST()
  const { todayGroup, weekGroup, olderGroup } = groupDates(dates, today)

  return (
    <aside
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--border)' }}
      className="flex h-screen w-56 shrink-0 flex-col"
    >
      {/* Header */}
      <div className="px-3 py-4">
        <Link
          href="/"
          style={{ color: 'var(--text)' }}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold hover:bg-[var(--hover)]"
        >
          <span>📰</span>
          <span className="truncate">Claude Daily Digest</span>
        </Link>
      </div>

      {/* Actions */}
      <div className="px-3 pb-3">
        <GenerateButton compact />
        <Link
          href="/input"
          style={{ color: 'var(--text-muted)' }}
          className="mt-0.5 flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
        >
          <span className="text-base">✏️</span>
          <span>メモを追加</span>
        </Link>
      </div>

      {/* Digest list */}
      <div className="flex-1 overflow-y-auto px-3 pb-2">
        {dates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }} className="px-2 text-xs">
            まだありません
          </p>
        ) : (
          <>
            <SidebarGroup label="今日" dates={todayGroup} today={today} />
            <SidebarGroup label="今週" dates={weekGroup} today={today} />
            <SidebarGroup label="それ以前" dates={olderGroup} today={today} />
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="px-3 py-2">
        <ThemeToggle />
      </div>
    </aside>
  )
}
