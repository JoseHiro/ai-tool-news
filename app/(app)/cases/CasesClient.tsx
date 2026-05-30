'use client'

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

const ICON_GRADIENTS = [
  ['#3b82f6', '#60a5fa'],
  ['#8b5cf6', '#a78bfa'],
  ['#10b981', '#34d399'],
  ['#f59e0b', '#fbbf24'],
  ['#ef4444', '#f87171'],
  ['#ec4899', '#f472b6'],
  ['#6366f1', '#818cf8'],
  ['#0ea5e9', '#38bdf8'],
]

function AppIcon({ name }: { name: string }) {
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % ICON_GRADIENTS.length
  const [from, to] = ICON_GRADIENTS[idx]
  const initial = name.replace(/\s/g, '')[0]?.toUpperCase() ?? '?'
  return (
    <div
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-sm"
    >
      {initial}
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
      <AppIcon name={c.name} />

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
          <p style={{ color: 'var(--text-muted)' }} className="mb-2 line-clamp-2 text-xs leading-relaxed">
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

      <div
        style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
        className="mt-6 flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💡</span>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
            あなたのアプリも掲載しませんか？成功事例をシェアして開発者コミュニティにインスピレーションを与えましょう。
          </p>
        </div>
        <button
          style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
          className="shrink-0 rounded-lg px-4 py-2 text-xs font-medium transition-colors hover:bg-[var(--hover)]"
        >
          事例を投稿する →
        </button>
      </div>
    </div>
  )
}
