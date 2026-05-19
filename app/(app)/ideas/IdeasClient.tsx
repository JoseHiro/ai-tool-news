'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { IdeaEntry, IdeaPattern } from '@/lib/search-index'

const PATTERNS: { label: string; value: IdeaPattern | 'all' }[] = [
  { label: '全て', value: 'all' },
  { label: '海外→日本', value: '海外→日本' },
  { label: '日本→海外', value: '日本→海外' },
  { label: '高すぎる→安価', value: '高すぎる→安価' },
  { label: 'その他', value: 'その他' },
]

const PATTERN_COLORS: Record<IdeaPattern, string> = {
  '海外→日本': '#3b82f6',
  '日本→海外': '#10b981',
  '高すぎる→安価': '#f59e0b',
  'その他': '#6b7280',
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 85 ? '#10b981' : score >= 75 ? '#3b82f6' : '#6b7280'
  return (
    <span
      style={{ color, border: `1px solid ${color}`, background: `${color}18` }}
      className="shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums"
    >
      {score}
    </span>
  )
}

function IdeaCard({ idea }: { idea: IdeaEntry }) {
  const patternColor = PATTERN_COLORS[idea.pattern]
  return (
    <Link
      href={`/digests/${idea.date}`}
      style={{ border: '1px solid var(--border)', background: 'var(--card-bg, var(--sidebar-bg))' }}
      className="group flex flex-col gap-2 rounded-xl p-4 transition-colors hover:border-[var(--accent)]"
    >
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">{idea.emoji}</span>
        <div className="min-w-0 flex-1">
          <p style={{ color: 'var(--text)' }} className="truncate text-sm font-semibold group-hover:text-[var(--accent)]">
            {idea.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <ScoreBadge score={idea.score} />
            <span
              style={{ color: patternColor, borderColor: `${patternColor}40`, background: `${patternColor}12` }}
              className="rounded border px-1.5 py-0.5 text-[10px] font-medium"
            >
              {idea.pattern}
            </span>
          </div>
        </div>
      </div>
      {idea.summary && (
        <p style={{ color: 'var(--text-muted)' }} className="line-clamp-2 text-xs leading-relaxed">
          {idea.summary}
        </p>
      )}
      <p style={{ color: 'var(--text-muted)' }} className="mt-auto text-[10px]">
        {idea.date}
      </p>
    </Link>
  )
}

export function IdeasClient({ ideas }: { ideas: IdeaEntry[] }) {
  const [pattern, setPattern] = useState<IdeaPattern | 'all'>('all')
  const [sort, setSort] = useState<'score' | 'date'>('score')

  const filtered = useMemo(() => {
    const base = pattern === 'all' ? ideas : ideas.filter(i => i.pattern === pattern)
    return [...base].sort((a, b) =>
      sort === 'score' ? b.score - a.score : b.date.localeCompare(a.date)
    )
  }, [ideas, pattern, sort])

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map(p => (
            <button
              key={p.value}
              onClick={() => setPattern(p.value)}
              style={{
                color: pattern === p.value ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${pattern === p.value ? 'var(--accent)' : 'var(--border)'}`,
                background: pattern === p.value ? 'var(--accent)18' : 'transparent',
              }}
              className="rounded-full px-3 py-1 text-xs font-medium transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {(['score', 'date'] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                color: sort === s ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: sort === s ? 600 : 400,
              }}
              className="px-2 py-1 text-xs transition-colors hover:text-[var(--text)]"
            >
              {s === 'score' ? 'スコア順' : '日付順'}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p style={{ color: 'var(--text-muted)' }} className="mb-4 text-xs">
        {filtered.length} 件
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">該当なし</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(idea => (
            <IdeaCard key={`${idea.date}-${idea.name}`} idea={idea} />
          ))}
        </div>
      )}
    </div>
  )
}
