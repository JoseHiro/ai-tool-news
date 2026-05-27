'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarDateLink } from './SidebarDateLink'

function formatMonth(ym: string) {
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m)}月`
}

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export function SidebarMonthGroup({
  ym,
  dates,
  today,
}: {
  ym: string
  dates: string[]
  today: string
}) {
  const pathname = usePathname()
  const isCurrentMonth = ym === today.slice(0, 7)
  const hasActive = dates.some(d => pathname === `/digests/${d}`)
  const [open, setOpen] = useState(isCurrentMonth || hasActive)

  const highlighted = isCurrentMonth || hasActive

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 rounded-lg px-3 py-1.5 transition-colors hover:bg-[var(--hover)]"
      >
        <span style={{ color: highlighted ? 'var(--accent)' : 'var(--text-muted)' }}>
          <CalendarIcon />
        </span>
        <span
          style={{ color: highlighted ? 'var(--text)' : 'var(--text-muted)' }}
          className={`flex-1 text-left text-xs ${highlighted ? 'font-semibold' : 'font-medium'}`}
        >
          {formatMonth(ym)}
        </span>
        {highlighted && (
          <span
            style={{ background: 'var(--accent)' }}
            className="h-1.5 w-1.5 shrink-0 rounded-full"
          />
        )}
      </button>

      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-1" style={{ borderColor: 'var(--border)' }}>
          {dates.map(date => (
            <SidebarDateLink key={date} date={date} isToday={date === today} />
          ))}
        </div>
      )}
    </div>
  )
}
