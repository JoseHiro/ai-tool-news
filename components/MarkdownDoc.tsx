'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { splitByH2, splitIdeas } from '@/lib/markdown'
import type { ClaudeSection, IdeasBlock } from '@/lib/markdown'
import { LikeButton } from '@/components/LikeButton'

function scoreColor(n: number): string {
  if (n >= 90) return '#10b981'
  if (n >= 80) return '#3b82f6'
  if (n >= 70) return '#f59e0b'
  return 'var(--text-muted)'
}

function detectTag(heading: string): string {
  if (heading.includes('⚡')) return 'TIPS'
  if (heading.includes('🆕')) return 'NEW'
  if (heading.includes('🛠')) return 'FLOW'
  if (heading.includes('💡')) return 'TIP'
  if (heading.includes('📊') || heading.includes('📋')) return 'GUIDE'
  return 'UPDATE'
}

// ── Claude section (document-style, no card box) ──────────────────────────────

function ClaudeSection({ section, components, date, likedKeys }: {
  section: ClaudeSection
  components: Components
  date?: string
  likedKeys?: Set<string>
}) {
  if (!section.heading) {
    return (
      <div className="mb-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {section.body}
        </ReactMarkdown>
      </div>
    )
  }

  const tag = detectTag(section.heading)
  const contentKey = section.heading.trim().slice(0, 80)
  const liked = likedKeys?.has(`tip:${date}:${contentKey}`) ?? false

  return (
    <div id={section.id} className="mb-10">
      {/* Heading row */}
      <div
        style={{ borderBottom: '1px solid var(--border)' }}
        className="mb-5 flex items-center justify-between pb-3"
      >
        <div className="flex items-center gap-2.5">
          <span
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest shrink-0"
          >
            {tag}
          </span>
          <h2 style={{ color: 'var(--text)' }} className="text-[15px] font-semibold leading-snug">
            {section.heading}
          </h2>
        </div>
        {date && likedKeys !== undefined && (
          <LikeButton
            contentType="tip"
            contentDate={date}
            contentKey={contentKey}
            title={section.heading}
            initialLiked={liked}
          />
        )}
      </div>

      {/* Body */}
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {section.body}
      </ReactMarkdown>
    </div>
  )
}

// ── Idea card ─────────────────────────────────────────────────────────────────

function IdeaCard({ block, components, date, likedKeys }: {
  block: Extract<IdeasBlock, { kind: 'app' }>
  components: Components
  date?: string
  likedKeys?: Set<string>
}) {
  const score = block.score ? parseInt(block.score) : 0
  const color = scoreColor(score)
  const contentKey = block.displayName.trim().slice(0, 80)
  const liked = likedKeys?.has(`idea:${date}:${contentKey}`) ?? false

  return (
    <div
      id={block.id}
      style={{ border: '1px solid var(--border)' }}
      className="mb-4 overflow-hidden rounded-xl"
    >
      {/* Header */}
      <div
        style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)' }}
        className="flex items-center justify-between px-5 py-3"
      >
        <div className="flex items-center gap-2">
          <span
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
          >
            IDEAS
          </span>
          {block.score && (
            <span
              style={{ color, border: `1px solid ${color}50`, background: `${color}14` }}
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
            >
              {block.score}
            </span>
          )}
          <span style={{ color: 'var(--text)' }} className="text-sm font-semibold leading-snug">
            {block.displayName}
          </span>
        </div>
        {date && likedKeys !== undefined && (
          <LikeButton
            contentType="idea"
            contentDate={date}
            contentKey={contentKey}
            title={block.displayName}
            initialLiked={liked}
          />
        )}
      </div>

      {/* Body */}
      <div style={{ background: 'var(--bg)' }} className="px-5 py-5">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {block.body}
        </ReactMarkdown>
      </div>
    </div>
  )
}

// ── Ideas renderer ────────────────────────────────────────────────────────────

function IdeasRenderer({ blocks, components, date, likedKeys }: {
  blocks: IdeasBlock[]
  components: Components
  date?: string
  likedKeys?: Set<string>
}) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'h2') {
          return (
            <h2
              key={i}
              style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
              className="mb-3 mt-6 pb-2 text-sm font-semibold first:mt-0"
            >
              {block.text}
            </h2>
          )
        }
        if (block.kind === 'app') {
          return <IdeaCard key={i} block={block} components={components} date={date} likedKeys={likedKeys} />
        }
        return (
          <div key={i}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
              {block.body}
            </ReactMarkdown>
          </div>
        )
      })}
    </>
  )
}

// ── Shared markdown components ────────────────────────────────────────────────

function makeComponents(): Components {
  return {
    h1: () => null,
    h2: ({ children }) => (
      <h2 style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
        className="mb-3 mt-6 pb-2 text-sm font-semibold first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ color: 'var(--text)' }} className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ color: 'var(--text-muted)' }} className="mb-3.5 text-[15px] leading-[1.7] last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 space-y-2 list-none">{children}</ol>,
    li: ({ children, ...props }) => {
      const isOrdered = (props as { ordered?: boolean }).ordered
      return (
        <li style={{ color: 'var(--text)' }} className="flex gap-2.5 text-[15px] leading-[1.7]">
          <span style={{ color: 'var(--text-muted)' }} className="mt-0.5 shrink-0 select-none">
            {isOrdered ? '›' : '–'}
          </span>
          <span className="flex-1 min-w-0">{children}</span>
        </li>
      )
    },
    a: ({ href, children }) => (
      <a href={href} target="_blank" rel="noopener noreferrer"
        style={{ color: 'var(--accent)' }} className="underline break-all hover:opacity-80">
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong style={{ color: 'var(--text)' }} className="font-semibold">{children}</strong>
    ),
    em: ({ children }) => (
      <em style={{ color: 'var(--text-muted)' }} className="italic">{children}</em>
    ),
    code: ({ children, className }) => {
      const lang = className?.replace('language-', '') ?? ''
      const isBlock = !!className
      if (isBlock) {
        return (
          <div className="mb-5 overflow-hidden rounded-lg" style={{ border: '1px solid var(--border)' }}>
            {lang && (
              <div style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
                className="px-4 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider">
                {lang}
              </div>
            )}
            <code style={{ background: 'var(--sidebar-bg)', color: 'var(--text)' }}
              className="block px-4 py-4 text-[13px] leading-relaxed font-mono whitespace-pre-wrap">
              {children}
            </code>
          </div>
        )
      }
      return (
        <code style={{ background: 'var(--hover)', color: 'var(--text)' }}
          className="rounded px-1.5 py-0.5 text-[13px] font-mono">
          {children}
        </code>
      )
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => (
      <blockquote style={{ borderColor: 'var(--accent)', background: 'var(--hover)' }}
        className="mb-4 rounded-r-lg border-l-2 px-4 py-3 text-[15px]">
        {children}
      </blockquote>
    ),
    hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-6" />,
    table: ({ children }) => (
      <div className="mb-5 overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: 'var(--sidebar-bg)' }}>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr style={{ borderBottom: '1px solid var(--border)' }}
        className="last:border-0 transition-colors hover:bg-[var(--hover)]">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th style={{ color: 'var(--text)' }} className="px-4 py-2.5 text-left text-xs font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ color: 'var(--text-muted)' }} className="px-4 py-3 text-sm">
        {children}
      </td>
    ),
  }
}

// ── MarkdownDoc ───────────────────────────────────────────────────────────────

const DOC_META = {
  claude: { tag: 'UPDATE', label: 'Claude / Claude Code' },
  ideas:  { tag: 'IDEAS',  label: '個人開発アイデア' },
}

export function MarkdownDoc({ content, type, id, date, likedKeys: likedKeysArr }: {
  content: string
  type: 'claude' | 'ideas'
  id?: string
  date?: string
  likedKeys?: string[]
}) {
  const meta = DOC_META[type]
  const body = content
    .replace(/^#[^\n]*\n/, '')
    .replace(/^>[^\n]*\n/, '')
    .trim()

  const components = makeComponents()
  const likedKeys = likedKeysArr ? new Set(likedKeysArr) : undefined

  return (
    <div id={id}>
      {/* Section label */}
      <div style={{ borderBottom: '1px solid var(--border)' }} className="mb-6 flex items-center gap-2.5 pb-3">
        <span
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
        >
          {meta.tag}
        </span>
        <h3 style={{ color: 'var(--text)' }} className="text-sm font-semibold">
          {meta.label}
        </h3>
      </div>

      {type === 'claude' && splitByH2(body, id).map((s, i) => (
        <ClaudeSection key={i} section={s} components={components} date={date} likedKeys={likedKeys} />
      ))}
      {type === 'ideas' && (
        <IdeasRenderer blocks={splitIdeas(body, id)} components={components} date={date} likedKeys={likedKeys} />
      )}
    </div>
  )
}
