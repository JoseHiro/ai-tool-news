import Link from 'next/link'
import { getDigestDates } from '@/lib/storage'
import { SidebarDateLink } from './SidebarDateLink'
import { GenerateButton } from './GenerateButton'
import { ThemeToggle } from './ThemeToggle'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export async function Sidebar() {
  const dates = await getDigestDates()
  const today = todayJST()

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
      <div className="px-3 pb-2">
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
      <div className="px-3 pb-2">
        <p
          style={{ color: 'var(--text-muted)' }}
          className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider"
        >
          Digest
        </p>
        {dates.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }} className="px-2 text-xs">
            まだありません
          </p>
        ) : (
          <div className="space-y-0.5">
            {dates.map((date) => (
              <SidebarDateLink key={date} date={date} isToday={date === today} />
            ))}
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="px-3 py-2">
        <ThemeToggle />
      </div>
    </aside>
  )
}
