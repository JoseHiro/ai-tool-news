'use client'

import { useState } from 'react'
import type { ClaudeDigest } from '@/types/digest'
import { CodeBlock } from '@/components/CodeBlock'
import { LikeButton } from '@/components/LikeButton'

// ── Icons ─────────────────────────────────────────────────────────────────────

function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      style={{ color: 'var(--text-muted)' }}
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Theme ─────────────────────────────────────────────────────────────────────

const cardTheme = {
  high: {
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    label: '注目',
    icon: <SparkleIcon />,
  },
  medium: {
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    label: 'UPDATE',
    icon: <ShieldIcon />,
  },
  low: {
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
    badgeBg: '#ede9fe',
    badgeText: '#6d28d9',
    label: 'UPDATE',
    icon: <RefreshIcon />,
  },
} as const

// ── UpdateCard ────────────────────────────────────────────────────────────────

export function UpdateCard({
  update,
  contentDate,
  contentKey,
  initialLiked,
}: {
  update: ClaudeDigest['updates'][number]
  contentDate?: string
  contentKey?: string
  initialLiked?: boolean
}) {
  const [open, setOpen] = useState(true)
  const [showCode, setShowCode] = useState(false)
  const theme = cardTheme[update.importance] ?? cardTheme.low

  return (
    <div style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-xl">
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]"
      >
        <div
          style={{ background: theme.iconBg, color: theme.iconColor }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        >
          {theme.icon}
        </div>
        <div className="min-w-0 flex-1">
          <span
            style={{ background: theme.badgeBg, color: theme.badgeText }}
            className="mb-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
          >
            {theme.label}
          </span>
          <p style={{ color: 'var(--text)' }} className="text-sm font-bold leading-snug line-clamp-1">
            {update.title}
          </p>
        </div>
        <ChevronIcon open={open} />
      </div>

      {/* Expanded content */}
      {open && (
        <div
          style={{ borderTop: '1px solid var(--border)' }}
          className="space-y-4 px-5 py-4"
        >
          <p style={{ color: 'var(--text-muted)' }} className="text-sm font-normal leading-relaxed">
            {update.body}
          </p>
          {update.code && (
            <div className="space-y-2">
              <button
                onClick={() => setShowCode(v => !v)}
                style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
                className="rounded px-2.5 py-1 text-xs transition-colors hover:bg-[var(--bg)]"
              >
                {showCode ? 'コードを閉じる ↑' : 'コードを見る ↓'}
              </button>
              {showCode && <CodeBlock lang={update.code.lang} code={update.code.code} />}
            </div>
          )}
          {contentDate && contentKey && (
            <div className="flex justify-end">
              <LikeButton
                contentType="tip"
                contentDate={contentDate}
                contentKey={contentKey}
                title={update.title}
                initialLiked={initialLiked ?? false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── TipCard ───────────────────────────────────────────────────────────────────

export function TipCard({
  tip,
  contentDate,
  contentKey,
  initialLiked,
}: {
  tip: ClaudeDigest['tips'][number]
  contentDate?: string
  contentKey?: string
  initialLiked?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [showCode, setShowCode] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-xl">
      {/* Header row */}
      <div
        onClick={() => setOpen(o => !o)}
        className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--hover)]"
      >
        <div
          style={{ background: '#f0fdf4', color: '#22c55e' }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <span
            style={{ background: '#f0fdf4', color: '#15803d' }}
            className="mb-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
          >
            TIPS
          </span>
          <p style={{ color: 'var(--text)' }} className="text-sm font-semibold leading-snug line-clamp-2">
            {tip.title}
          </p>
        </div>
        {contentDate && contentKey && (
          <div onClick={e => e.stopPropagation()}>
            <LikeButton
              contentType="tip"
              contentDate={contentDate}
              contentKey={contentKey}
              title={tip.title}
              initialLiked={initialLiked ?? false}
            />
          </div>
        )}
        <ChevronIcon open={open} />
      </div>

      {/* Expanded content */}
      {open && (
        <div
          style={{ borderTop: '1px solid var(--border)' }}
          className="space-y-4 px-5 py-4"
        >
          <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
            {tip.description}
          </p>
          {tip.code && (
            <div className="space-y-2">
              <button
                onClick={() => setShowCode(v => !v)}
                style={{ color: 'var(--accent)', border: '1px solid var(--border)' }}
                className="rounded px-2.5 py-1 text-xs transition-colors hover:bg-[var(--bg)]"
              >
                {showCode ? 'コードを閉じる ↑' : 'コードを見る ↓'}
              </button>
              {showCode && <CodeBlock lang={tip.code.lang} code={tip.code.code} />}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── WorkflowCard ──────────────────────────────────────────────────────────────

export function WorkflowCard({ workflow }: { workflow: ClaudeDigest['workflow'] }) {
  return (
    <div style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-xl">
      <div style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }} className="px-4 py-3">
        <h3 style={{ color: 'var(--text)' }} className="text-sm font-semibold">🛠 {workflow.title}</h3>
      </div>
      <div>
        {workflow.steps.map((step, i) => (
          <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }} className="flex gap-3 px-4 py-3">
            <span
              style={{ background: 'var(--accent)', color: '#fff' }}
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              <p style={{ color: 'var(--text)' }} className="text-xs font-medium">{step.label}</p>
              {step.code && (
                <pre
                  style={{ background: 'var(--code-bg, #0d1117)', color: '#e6edf3', border: '1px solid var(--border)' }}
                  className="overflow-x-auto whitespace-pre-wrap rounded-lg px-3 py-2 text-xs font-mono"
                >
                  {step.code}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ModelGuideTable ───────────────────────────────────────────────────────────

export function ModelGuideTable({ guide }: { guide: ClaudeDigest['modelGuide'] }) {
  const costLabel = { high: '高', medium: '中', low: '低' }
  return (
    <div style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'var(--hover)', color: 'var(--text-muted)' }}>
            <th className="px-4 py-2.5 text-left text-xs font-semibold">モデル</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold">用途</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold">コスト</th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold hidden sm:table-cell">使う場面</th>
          </tr>
        </thead>
        <tbody>
          {guide.map((row, i) => (
            <tr key={i} style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
              <td className="px-4 py-2.5 font-mono text-xs">{row.model}</td>
              <td className="px-4 py-2.5 text-xs">{row.useCase}</td>
              <td className="px-4 py-2.5 text-xs">{costLabel[row.cost]}</td>
              <td className="px-4 py-2.5 text-xs hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{row.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
