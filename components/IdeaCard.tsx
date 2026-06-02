'use client'

import { useState } from 'react'
import type { IdeaDigest } from '@/types/digest'
import { LikeButton } from '@/components/LikeButton'

const threatColor = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-green-400' }
const directionLabel = {
  'overseas-to-japan': '海外→日本',
  'japan-to-overseas': '日本→海外',
  'cheaper-alternative': '安価な代替',
}
const platformLabel = { web: 'Web', mobile: 'Mobile', extension: '拡張機能', cli: 'CLI' }

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
  const contentKey = idea.name.toLowerCase().replace(/\s+/g, '-')

  return (
    <div style={{ border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden">
      {/* Compact header row — always visible */}
      <div
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        {/* Emoji icon */}
        <div
          style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}
          className="shrink-0 rounded-xl flex items-center justify-center w-[52px] h-[52px] text-2xl"
        >
          {idea.emoji}
        </div>

        {/* Name + direction + overview */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span style={{ color: 'var(--text)' }} className="text-sm font-bold">{idea.name}</span>
            <span
              style={{ background: 'var(--hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px]"
            >
              {directionLabel[idea.direction]}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs line-clamp-2 leading-relaxed">{idea.overview}</p>
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
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
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
            {/* Market */}
            <div style={{ border: '1px solid var(--border)' }} className="rounded-lg overflow-hidden">
              <p style={{ color: 'var(--text-muted)', background: 'var(--hover)', borderBottom: '1px solid var(--border)' }} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                市場
              </p>
              <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">ターゲット</p>
                <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.market.target}</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">市場規模</p>
                <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.market.size}</p>
              </div>
              <div className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">競合の隙間</p>
                <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">{idea.market.gap}</p>
              </div>
            </div>

            {/* Revenue */}
            <div style={{ border: '1px solid var(--border)' }} className="rounded-lg overflow-hidden">
              <p style={{ color: 'var(--text-muted)', background: 'var(--hover)', borderBottom: '1px solid var(--border)' }} className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
                収益
              </p>
              <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">無料プラン</p>
                <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.revenue.free}</p>
              </div>
              <div style={{ borderBottom: '1px solid var(--border)' }} className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">価格</p>
                <p style={{ color: 'var(--text)' }} className="text-xs font-semibold leading-relaxed">{idea.revenue.price}</p>
              </div>
              <div className="px-3 py-2.5">
                <p style={{ color: 'var(--text-muted)' }} className="mb-0.5 text-[10px]">モデル</p>
                <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.revenue.model}</p>
              </div>
            </div>
          </div>

          {/* Features + AI Usage grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Features */}
            <div style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }} className="rounded-xl p-4">
              <p style={{ color: 'var(--text)' }} className="mb-3 text-xs font-semibold">主な機能</p>
              <ul className="space-y-2">
                {idea.features.map((f, i) => (
                  <li key={i} style={{ color: 'var(--text)' }} className="flex items-start gap-2 text-xs leading-relaxed">
                    <svg style={{ color: 'var(--accent)', opacity: 0.75 }} className="mt-0.5 shrink-0 w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Usage */}
            <div style={{ border: '1px solid var(--border)', background: 'rgba(0,0,0,0.02)' }} className="rounded-xl p-4">
              <p style={{ color: 'var(--accent)' }} className="mb-3 text-xs font-semibold">AI活用</p>
              <p style={{ color: 'var(--text)' }} className="text-xs leading-relaxed">{idea.aiUsage}</p>
            </div>
          </div>

          {/* Competitors */}
          <div>
            <p style={{ color: 'var(--text-muted)' }} className="mb-2 text-[10px] font-semibold uppercase tracking-wider">競合と優位性</p>
            <div style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--bg)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                    <th className="px-3 py-2 text-left font-semibold">サービス</th>
                    <th className="px-3 py-2 text-left font-semibold">弱点</th>
                  </tr>
                </thead>
                <tbody>
                  {idea.competitors.map((c, i) => (
                    <tr key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined, background: 'var(--bg)' }}>
                      <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--text)' }}>
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${threatColor[c.threat]}`} style={{ background: 'currentColor' }} />
                        {c.name}
                      </td>
                      <td className="px-3 py-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{c.weakness}</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid var(--border)', background: `var(--accent)18` }}>
                    <td className="px-3 py-2 font-semibold whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle bg-current" />
                      {idea.name}（本アイデア）
                    </td>
                    <td className="px-3 py-2" style={{ color: 'var(--text-muted)' }}>—</td>
                  </tr>
                </tbody>
              </table>
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
