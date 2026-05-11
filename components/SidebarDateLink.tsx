'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function formatSidebarDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${m}/${d}`
}

export function SidebarDateLink({
  date,
  isToday,
}: {
  date: string
  isToday: boolean
}) {
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
      className="flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
    >
      <span className="text-xs opacity-60">📄</span>
      <span className="flex-1 truncate">
        {isToday ? `${formatSidebarDate(date)} 今日` : formatSidebarDate(date)}
      </span>
    </Link>
  )
}
