'use client'

import { useState, useMemo } from 'react'
import type { SuccessCase } from '@/types/digest'

type MetricFilter = 'all' | 'MRR' | '売上' | 'DL' | 'レビュー数' | 'その他'
type PlatformFilter = 'all' | 'mobile' | 'web' | 'extension' | 'mac' | 'other'
type SortKey = 'metric' | 'name'

const METRIC_COLORS: Record<string, string> = {
  MRR: '#10b981',
  '売上': '#3b82f6',
  DL: '#f59e0b',
  'レビュー数': '#8b5cf6',
  'その他': '#6b7280',
}

const PLATFORM_LABELS: Record<string, string> = {
  mobile: 'モバイル',
  web: 'Web',
  extension: '拡張機能',
  mac: 'Mac',
  other: 'その他',
}

function CaseCard({ c }: { c: SuccessCase }) {
  const metricColor = METRIC_COLORS[c.metricLabel] ?? '#6b7280'
  return (
    <div
      style={{ border: '1px solid var(--border)' }}
      className="flex flex-col gap-3 rounded-xl p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p style={{ color: 'var(--text)' }} className="truncate text-sm font-semibold">
            {c.name}
          </p>
          <p style={{ color: 'var(--text-muted)' }} className="mt-0.5 text-[11px]">
            {c.developer}
          </p>
        </div>
        <span
          style={{ color: metricColor, border: `1px solid ${metricColor}40`, background: `${metricColor}12` }}
          className="shrink-0 rounded px-2 py-0.5 text-xs font-bold tabular-nums"
        >
          {c.metricDisplay}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="rounded px-1.5 py-0.5 text-[10px]"
        >
          {PLATFORM_LABELS[c.platform] ?? c.platform}
        </span>
        <span
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="rounded px-1.5 py-0.5 text-[10px]"
        >
          {c.category}
        </span>
        <span
          style={{ color: metricColor, border: `1px solid ${metricColor}30`, background: `${metricColor}08` }}
          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
        >
          {c.metricLabel}
        </span>
      </div>

      {c.notes && (
        <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
          {c.notes}
        </p>
      )}

      {c.url && (
        <a
          href={c.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent)' }}
          className="text-xs hover:underline"
        >
          リンクを開く →
        </a>
      )}
    </div>
  )
}

export function CasesClient({ cases }: { cases: SuccessCase[] }) {
  const [metric, setMetric] = useState<MetricFilter>('all')
  const [platform, setPlatform] = useState<PlatformFilter>('all')
  const [sort, setSort] = useState<SortKey>('metric')

  const metricOptions: { label: string; value: MetricFilter }[] = [
    { label: '全て', value: 'all' },
    { label: 'MRR', value: 'MRR' },
    { label: '売上', value: '売上' },
    { label: 'DL数', value: 'DL' },
    { label: 'レビュー数', value: 'レビュー数' },
    { label: 'その他', value: 'その他' },
  ]

  const platformOptions: { label: string; value: PlatformFilter }[] = [
    { label: '全て', value: 'all' },
    { label: 'モバイル', value: 'mobile' },
    { label: 'Web', value: 'web' },
    { label: '拡張機能', value: 'extension' },
    { label: 'Mac', value: 'mac' },
  ]

  const filtered = useMemo(() => {
    let base = cases
    if (metric !== 'all') base = base.filter(c => c.metricLabel === metric)
    if (platform !== 'all') base = base.filter(c => c.platform === platform)
    return [...base].sort((a, b) =>
      sort === 'metric' ? b.metricValue - a.metricValue : a.name.localeCompare(b.name, 'ja')
    )
  }, [cases, metric, platform, sort])

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {metricOptions.map(o => (
            <button
              key={o.value}
              onClick={() => setMetric(o.value)}
              style={{
                color: metric === o.value ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${metric === o.value ? 'var(--accent)' : 'var(--border)'}`,
                background: metric === o.value ? 'var(--accent)18' : 'transparent',
              }}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {platformOptions.map(o => (
              <button
                key={o.value}
                onClick={() => setPlatform(o.value)}
                style={{
                  color: platform === o.value ? 'var(--text)' : 'var(--text-muted)',
                  border: `1px solid ${platform === o.value ? 'var(--border)' : 'transparent'}`,
                  background: platform === o.value ? 'var(--hover)' : 'transparent',
                }}
                className="rounded px-2 py-0.5 text-[11px] transition-colors"
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-1">
            {(['metric', 'name'] as SortKey[]).map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  color: sort === s ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: sort === s ? 600 : 400,
                }}
                className="px-2 py-1 text-xs transition-colors hover:text-[var(--text)]"
              >
                {s === 'metric' ? '数値順' : '名前順'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--text-muted)' }} className="mb-4 text-xs">
        {filtered.length} 件
      </p>

      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">該当なし</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <CaseCard key={`${c.developer}-${c.name}-${i}`} c={c} />
          ))}
        </div>
      )}
    </div>
  )
}
