'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s぀-ヿ㐀-䶿一-鿿]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

function makeComponents(): Components {
  return {
    h1: () => null,
    h2: ({ children }) => {
      const text = typeof children === 'string' ? children : String(children)
      const id = `h2-${slugify(text)}`
      return (
        <h2
          id={id}
          style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
          className="mb-4 mt-10 pb-3 text-base font-bold first:mt-0 scroll-mt-6"
        >
          {children}
        </h2>
      )
    },
    h3: ({ children }) => (
      <h3 style={{ color: 'var(--text)' }} className="mb-2 mt-6 text-sm font-semibold">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ color: 'var(--text-muted)' }} className="mb-1.5 mt-4 text-sm font-semibold">
        {children}
      </h4>
    ),
    p: ({ children }) => (
      <p style={{ color: 'var(--text-muted)' }} className="mb-4 text-sm leading-7 last:mb-0">
        {children}
      </p>
    ),
    ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
    ol: ({ children }) => <ol className="mb-4 space-y-2 list-none">{children}</ol>,
    li: ({ children, ...props }) => {
      const isOrdered = (props as { ordered?: boolean }).ordered
      return (
        <li style={{ color: 'var(--text)' }} className="flex gap-2.5 text-sm leading-relaxed">
          <span style={{ color: 'var(--accent)' }} className="mt-0.5 shrink-0 select-none font-bold">
            {isOrdered ? '›' : '·'}
          </span>
          <span className="flex-1 min-w-0" style={{ color: 'var(--text-muted)' }}>{children}</span>
        </li>
      )
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--accent)' }}
        className="underline underline-offset-2 break-all hover:opacity-80"
      >
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
          <div className="mb-5 overflow-hidden rounded-xl" style={{ border: '1px solid var(--border)' }}>
            {lang && (
              <div
                style={{
                  background: 'var(--hover)',
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
                className="flex items-center justify-between px-4 py-2"
              >
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider">{lang}</span>
              </div>
            )}
            <code
              style={{ background: 'var(--sidebar-bg)', color: 'var(--text)' }}
              className="block px-5 py-4 text-xs leading-relaxed font-mono whitespace-pre-wrap"
            >
              {children}
            </code>
          </div>
        )
      }
      return (
        <code
          style={{ background: 'var(--hover)', color: 'var(--text)', border: '1px solid var(--border)' }}
          className="rounded-md px-1.5 py-0.5 text-xs font-mono"
        >
          {children}
        </code>
      )
    },
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => (
      <blockquote
        style={{ borderColor: 'var(--accent)', background: 'var(--hover)' }}
        className="mb-5 rounded-r-xl border-l-2 px-5 py-4 text-sm"
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr style={{ borderColor: 'var(--border)' }} className="my-8" />,
    table: ({ children }) => (
      <div className="mb-5 overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead style={{ background: 'var(--sidebar-bg)' }}>{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr
        style={{ borderBottom: '1px solid var(--border)' }}
        className="last:border-0 transition-colors hover:bg-[var(--hover)]"
      >
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th style={{ color: 'var(--text)' }} className="px-4 py-3 text-left text-xs font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td style={{ color: 'var(--text-muted)' }} className="px-4 py-3 text-xs leading-relaxed">
        {children}
      </td>
    ),
  }
}

export function GuideContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={makeComponents()}>
      {content}
    </ReactMarkdown>
  )
}
