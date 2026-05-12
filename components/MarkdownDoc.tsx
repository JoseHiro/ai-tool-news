'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { splitByH2, splitIdeas } from '@/lib/markdown'
import type { ClaudeSection, IdeasBlock } from '@/lib/markdown'

// ── Shared ─────────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function Collapsible({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'grid-template-rows 0.2s ease',
    }}>
      <div style={{ minHeight: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

// ── CLAUDE — h2 accordion ──────────────────────────────────────────────────

function H2AccordionSection({ section, components }: { section: ClaudeSection; components: Components }) {
  const [open, setOpen] = useState(true)

  if (!section.heading) {
    return (
      <div className="pb-1">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {section.body}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)' }}>
      <button
        id={section.id}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{ color: 'var(--text)' }}
        className="flex w-full items-center justify-between py-2.5 text-sm font-semibold transition-opacity hover:opacity-70"
      >
        <span className="text-left">{section.heading}</span>
        <span style={{ color: 'var(--text-muted)' }} className="ml-3 shrink-0">
          <ChevronIcon open={open} />
        </span>
      </button>
      <Collapsible open={open}>
        <div className="pb-4 pt-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {section.body}
          </ReactMarkdown>
        </div>
      </Collapsible>
    </div>
  )
}

// ── IDEAS — h3 app accordion ───────────────────────────────────────────────

function AppCard({ block, components }: { block: Extract<IdeasBlock, { kind: 'app' }>; components: Components }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '8px' }} className="mb-2 overflow-hidden">
      <button
        id={block.id}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        style={{ background: 'var(--sidebar-bg)', color: 'var(--text)' }}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-opacity hover:opacity-80"
      >
        <span className="text-left">{block.displayName}</span>
        <span className="ml-3 flex shrink-0 items-center gap-2">
          {block.score && (
            <span
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--bg)' }}
              className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
            >
              {block.score}
            </span>
          )}
          <span style={{ color: 'var(--text-muted)' }}>
            <ChevronIcon open={open} />
          </span>
        </span>
      </button>
      <Collapsible open={open}>
        <div style={{ borderTop: '1px solid var(--border)' }} className="px-4 py-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {block.body}
          </ReactMarkdown>
        </div>
      </Collapsible>
    </div>
  )
}

function IdeasRenderer({ blocks, components }: { blocks: IdeasBlock[]; components: Components }) {
  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === 'h2') {
          return (
            <h2 key={i}
              style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
              className="mb-3 mt-6 pb-2 text-sm font-semibold first:mt-0">
              {block.text}
            </h2>
          )
        }
        if (block.kind === 'app') {
          return <AppCard key={i} block={block} components={components} />
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

// ── Shared markdown components ─────────────────────────────────────────────

function makeComponents(): Components {
  return {
    h1: () => null,
    h2: ({ children }) => (
      <h2 style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
        className="mb-3 mt-4 pb-2 text-sm font-semibold first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ color: 'var(--text)' }} className="mb-2 mt-4 text-sm font-medium">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ color: 'var(--text-muted)' }} className="mb-3 text-sm leading-relaxed last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => <ul className="mb-4 space-y-1.5">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 space-y-1.5 list-none">{children}</ol>,
    li: ({ children, ...props }) => {
      const isOrdered = (props as { ordered?: boolean }).ordered
      return (
        <li style={{ color: 'var(--text)' }} className="flex gap-2 text-sm leading-relaxed">
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
          <div className="mb-4 overflow-hidden rounded-lg" style={{ border: '1px solid var(--border)' }}>
            {lang && (
              <div style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}
                className="px-4 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider">
                {lang}
              </div>
            )}
            <code style={{ background: 'var(--sidebar-bg)', color: 'var(--text)' }}
              className="block px-4 py-3 text-xs leading-relaxed font-mono whitespace-pre-wrap">
              {children}
            </code>
          </div>
        )
      }
      return (
        <code style={{ background: 'var(--hover)', color: 'var(--text)' }}
          className="rounded px-1.5 py-0.5 text-xs font-mono">
          {children}
        </code>
      )
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => (
      <blockquote style={{ borderColor: 'var(--accent)', background: 'var(--hover)' }}
        className="mb-4 rounded-r-lg border-l-2 px-4 py-3 text-sm">
        {children}
      </blockquote>
    ),
    hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-4" />,
    table: ({ children }) => (
      <div className="mb-4 overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm border-collapse">{children}</table>
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
      <td style={{ color: 'var(--text-muted)' }} className="px-4 py-2.5 text-xs">
        {children}
      </td>
    ),
  }
}

// ── Card ───────────────────────────────────────────────────────────────────

const DOC_META = {
  claude: { tag: 'UPDATE', label: 'Claude / Claude Code' },
  ideas:  { tag: 'IDEAS',  label: '個人開発アイデア' },
}

export function MarkdownDoc({ content, type, id }: { content: string; type: 'claude' | 'ideas'; id?: string }) {
  const meta = DOC_META[type]
  const body = content
    .replace(/^#[^\n]*\n/, '')
    .replace(/^>[^\n]*\n/, '')
    .trim()

  const components = makeComponents()

  return (
    <div id={id} style={{ border: '1px solid var(--border)' }} className="overflow-hidden rounded-xl">
      <div style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)' }}
        className="flex items-center gap-2.5 px-5 py-3">
        <span style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest">
          {meta.tag}
        </span>
        <h3 style={{ color: 'var(--text)' }} className="text-sm font-semibold">
          {meta.label}
        </h3>
      </div>
      <div style={{ background: 'var(--bg)' }} className="px-5 py-4">
        {type === 'claude' && splitByH2(body, id).map((s, i) => (
          <H2AccordionSection key={i} section={s} components={components} />
        ))}
        {type === 'ideas' && (
          <IdeasRenderer blocks={splitIdeas(body, id)} components={components} />
        )}
      </div>
    </div>
  )
}
