'use client'

import type React from 'react'
import type { SuccessCase } from '@/types/digest'

type Badge = 'NEW' | 'SHIPPED' | 'STACK' | 'FIRST APP'

const BADGE: Record<Badge, { bg: string; color: string }> = {
  'NEW':       { bg: '#8b5cf618', color: '#8b5cf6' },
  'SHIPPED':   { bg: '#6b728018', color: '#6b7280' },
  'STACK':     { bg: '#10b98118', color: '#10b981' },
  'FIRST APP': { bg: '#f59e0b18', color: '#f59e0b' },
}

function getBadge(c: SuccessCase, today: string): Badge {
  if (c.sourceDate === today) return 'NEW'
  if (c.notes?.includes('初アプリ')) return 'FIRST APP'
  if (c.notes?.includes('ポートフォリオ') || c.metricDisplay === '複数アプリ運用') return 'STACK'
  return 'SHIPPED'
}

const PLATFORM_ICON: Record<string, { color: string; icon: React.ReactNode }> = {
  mobile: {
    color: '#3b82f6',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2" />
      </svg>
    ),
  },
  web: {
    color: '#10b981',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  extension: {
    color: '#f59e0b',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1 2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5a2.5 2.5 0 0 1 0 5H2V19a2 2 0 0 0 2 2h4v-1.5a2.5 2.5 0 0 1 5 0V21h4a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 0-5z" />
      </svg>
    ),
  },
  mac: {
    color: '#6366f1',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  other: {
    color: '#8b5cf6',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
}

function AppIcon({ platform }: { platform: string }) {
  const { color, icon } = PLATFORM_ICON[platform] ?? PLATFORM_ICON.other
  return (
    <div
      style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}
      className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl"
    >
      {icon}
    </div>
  )
}

function TrendLine({ color }: { color: string }) {
  return (
    <svg style={{ color }} className="h-4 w-10" viewBox="0 0 40 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2,14 8,9 16,11 24,5 38,2" />
    </svg>
  )
}

function MetricBox({ c }: { c: SuccessCase }) {
  if (c.metricValue > 0) {
    const color = c.metricLabel === 'MRR' || c.metricLabel === '売上' ? '#10b981' : '#3b82f6'
    return (
      <div className="flex min-w-[130px] flex-col items-center gap-0.5 text-center">
        <p style={{ color }} className="text-[11px] font-semibold uppercase tracking-wider">
          {c.metricLabel}
        </p>
        <p style={{ color }} className="text-[28px] font-bold leading-tight tabular-nums">
          {c.metricDisplay}
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="mt-0.5 text-[10px]">
          継続成長中
        </p>
        <TrendLine color={color} />
      </div>
    )
  }

  const isStack = c.metricDisplay === '複数アプリ運用'
  const boxColor = isStack ? '#8b5cf6' : '#6b7280'
  const subText = c.platform === 'mobile' ? 'iOS App Store' : c.platform === 'web' ? 'Web App' : c.platform

  return (
    <div
      style={{ background: `${boxColor}10`, border: `1px solid ${boxColor}25` }}
      className="flex min-w-[130px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-4"
    >
      <p style={{ color: boxColor }} className="text-center text-xs font-semibold leading-snug">
        {c.metricDisplay}
      </p>
      {!isStack && (
        <p style={{ color: 'var(--text-muted)' }} className="text-[10px]">
          {subText}
        </p>
      )}
      {isStack && (
        <p style={{ color: 'var(--text-muted)' }} className="text-[10px]">
          ポートフォリオ
        </p>
      )}
    </div>
  )
}

function CaseCard({ c, today }: { c: SuccessCase; today: string }) {
  const badge = getBadge(c, today)
  const { bg, color } = BADGE[badge]

  return (
    <div
      style={{ border: '1px solid var(--border)' }}
      className="flex items-center gap-5 rounded-2xl p-5 transition-shadow hover:shadow-sm"
    >
      <AppIcon platform={c.platform} />

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <p style={{ color: 'var(--text)' }} className="text-sm font-bold">
            {c.name}
          </p>
          <span
            style={{ color, background: bg, border: `1px solid ${color}30` }}
            className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
          >
            {badge}
          </span>
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5">
          <span
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            className="rounded px-1.5 py-0.5 text-[10px]"
          >
            {c.platform === 'mobile' ? 'iOS' : c.platform === 'web' ? 'Web' : c.platform}
          </span>
          <span
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            className="rounded px-1.5 py-0.5 text-[10px]"
          >
            {c.category}
          </span>
        </div>

        {c.notes && (
          <p style={{ color: 'var(--text-muted)' }} className="mb-2 text-xs leading-relaxed">
            {c.notes}
          </p>
        )}

        <div className="flex items-center gap-1.5">
          <svg style={{ color: 'var(--text-muted)' }} className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <p style={{ color: 'var(--text-muted)' }} className="text-[11px]">
            {c.developer}
          </p>
        </div>
      </div>

      <MetricBox c={c} />
    </div>
  )
}

export function CasesClient({ cases, today }: { cases: SuccessCase[]; today: string }) {
  if (cases.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)' }} className="text-sm">
        成功事例はまだありません。
      </p>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {cases.map((c, i) => (
          <CaseCard key={`${c.developer}-${c.name}-${i}`} c={c} today={today} />
        ))}
      </div>

    </div>
  )
}
