'use client'

import Link from 'next/link'
import type { TipEntry } from '@/lib/search-index'

type GroupedTips = {
  date: string
  topic: string
  tips: TipEntry[]
}

function groupByDate(tips: TipEntry[]): GroupedTips[] {
  const map = new Map<string, GroupedTips>()
  for (const tip of tips) {
    if (!map.has(tip.date)) {
      map.set(tip.date, { date: tip.date, topic: tip.topic, tips: [] })
    }
    map.get(tip.date)!.tips.push(tip)
  }
  return [...map.values()].sort((a, b) => b.date.localeCompare(a.date))
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

export function TipsClient({ tips }: { tips: TipEntry[] }) {
  const groups = groupByDate(tips)

  if (groups.length === 0) {
    return <p style={{ color: 'var(--text-muted)' }} className="text-sm">まだデータがありません</p>
  }

  return (
    <div className="space-y-10">
      {groups.map(group => (
        <div key={group.date}>
          {/* Group header */}
          <div className="mb-4 flex items-baseline gap-3">
            <Link
              href={`/digests/${group.date}`}
              style={{ color: 'var(--text)' }}
              className="text-sm font-semibold hover:text-[var(--accent)]"
            >
              {formatDate(group.date)}
            </Link>
            {group.topic && (
              <span style={{ color: 'var(--text-muted)' }} className="truncate text-xs">
                — {group.topic}
              </span>
            )}
          </div>

          {/* Tips list */}
          <div className="space-y-2 pl-3" style={{ borderLeft: '2px solid var(--border)' }}>
            {group.tips.map((tip, i) => (
              <Link
                key={i}
                href={`/digests/${tip.date}`}
                className="group block rounded-lg px-3 py-2.5 transition-colors hover:bg-[var(--hover)]"
              >
                <p style={{ color: 'var(--text)' }} className="text-sm font-medium group-hover:text-[var(--accent)]">
                  {tip.title}
                </p>
                {tip.excerpt && (
                  <p style={{ color: 'var(--text-muted)' }} className="mt-0.5 line-clamp-1 text-xs">
                    {tip.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
