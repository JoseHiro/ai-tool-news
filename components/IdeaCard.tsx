'use client'

import { useState } from 'react'
import type { IdeaDigest } from '@/types/digest'
import { LikeButton } from '@/components/LikeButton'

const threatColor = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-green-400' }
const directionLabel = {
  'overseas-to-japan': '🌏 海外→日本',
  'japan-to-overseas': '🗾 日本→海外',
  'cheaper-alternative': '💸 安価な代替',
}
const platformLabel = { web: 'Web', mobile: 'Mobile', extension: '拡張機能', cli: 'CLI' }

function scoreColor(score: number) {
  if (score >= 85) return '#22c55e'
  if (score >= 75) return '#f59e0b'
  return '#94a3b8'
}

export function IdeaCard({
  idea,
  contentDate,
  initialLiked,
}: {
  idea: IdeaDigest['ideas'][number]
  contentDate?: string
  initialLiked?: boolean
}) {
  const [open, setOpen] = useState(false)
  const color = scoreColor(idea.score)
  const contentKey = idea.name.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden">
      {/* Compact header row — always visible */}
      <div
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <span className="text-xl shrink-0">{idea.emoji}</span>

        {/* Score badge */}
        <span
          style={{ color, border: `1px solid ${color}55`, background: `${color}15` }}
          className="shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold tabular-nums"
        >
          {idea.score}
        </span>

        {/* Name + overview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ color: 'var(--text)' }} className="text-sm font-semibold">{idea.name}</span>
            <span style={{ color: 'var(--accent)', opacity: 0.85 }} className="text-xs shrink-0">
              {directionLabel[idea.direction]}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs truncate mt-0.5">{idea.overview}</p>
        </div>

        {/* Top 2 tags (hidden on mobile) */}
        <div className="hidden sm:flex gap-1 shrink-0">
          {idea.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              style={{ background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              className="rounded-full px-2 py-0.5 text-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* いいかも button */}
        {contentDate && (
          <div onClick={e => e.stopPropagation()}>
            <LikeButton
              contentType="idea"
              contentDate={contentDate}
              contentKey={contentKey}
              title={idea.name}
              initialLiked={initialLiked ?? false}
            />
          </div>
        )}

        {/* Chevron */}
        <svg
          style={{ color: 'var(--text-muted)' }}
          className={`shrink-0 w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* Expanded details */}
      {open && (
        <div
          style={{ borderTop: '1px solid var(--border)', background: 'var(--hover)' }}
          className="px-4 py-4 space-y-4"
        >
          {/* Platform */}
          <span
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--bg)' }}
            className="inline-block rounded px-1.5 py-0.5 text-xs"
          >
            {platformLabel[idea.platform]}
          </span>

          {/* Market + Revenue grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)' }} className="rounded-lg p-3 space-y-1">
              <p style={{ color: 'var(--text-muted)' }} className="text-[10px] font-semibold uppercase tracking-wider">市場</p>
              <p style={{ color: 'var(--text)' }} className="text-xs">🎯 {idea.market.target}</p>
              <p style={{ color: 'var(--text)' }} className="text-xs">📊 {idea.market.size}</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs">💡 {idea.market.gap}</p>
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)' }} className="rounded-lg p-3 space-y-1">
              <p style={{ color: 'var(--text-muted)' }} className="text-[10px] font-semibold uppercase tracking-wider">収益</p>
              <p style={{ color: 'var(--text)' }} className="text-xs">無料: {idea.revenue.free}</p>
              <p style={{ color: 'var(--text)' }} className="text-xs font-semibold">{idea.revenue.price}</p>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs">{idea.revenue.model}</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <p style={{ color: 'var(--text-muted)' }} className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider">主な機能</p>
            <ul className="space-y-0.5">
              {idea.features.map((f, i) => (
                <li key={i} style={{ color: 'var(--text)' }} className="flex items-start gap-1.5 text-xs">
                  <span style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0">›</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* AI Usage */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)' }} className="rounded-lg p-3">
            <p style={{ color: 'var(--text-muted)' }} className="mb-1 text-[10px] font-semibold uppercase tracking-wider">AI活用</p>
            <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.aiUsage}</p>
          </div>

          {/* Competitors */}
          <div>
            <p style={{ color: 'var(--text-muted)' }} className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider">競合</p>
            <div className="space-y-1">
              {idea.competitors.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 font-semibold ${threatColor[c.threat]}`}>{c.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>— {c.weakness}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusion + Tags */}
          <div style={{ borderTop: '1px solid var(--border)' }} className="pt-3 space-y-2">
            <p style={{ color: 'var(--text)' }} className="text-xs font-medium">{idea.conclusion}</p>
            <div className="flex flex-wrap gap-1">
              {idea.tags.map(tag => (
                <span
                  key={tag}
                  style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  className="rounded-full px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
