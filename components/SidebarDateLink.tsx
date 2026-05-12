'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function formatSidebarDate(date: string) {
  const [, m, d] = date.split('-')
  return `${parseInt(m)}月${parseInt(d)}日`
}

export function SidebarDateLink({ date, isToday }: { date: string; isToday: boolean }) {
  const pathname = usePathname()
  const href = isToday ? '/' : `/digests/${date}`
  const isActive = isToday ? pathname === '/' : pathname === `/digests/${date}`

  return (
    <Link
      href={href}
      style={{
        background: isActive ? 'var(--hover)' : undefined,
        color: isActive ? 'var(--text)' : 'var(--text-muted)',
      }}
      className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
    >
      <span>{formatSidebarDate(date)}</span>
      {isToday && (
        <span
          style={{ background: 'var(--accent)', color: '#fff' }}
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
        >
          今日
        </span>
      )}
    </Link>
  )
}
