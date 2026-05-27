'use client'

import { useState } from 'react'

export function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ background: 'var(--code-bg, #0d1117)', border: '1px solid var(--border)' }} className="relative rounded-lg overflow-hidden">
      <div style={{ borderBottom: '1px solid var(--border)' }} className="flex items-center justify-between px-4 py-1.5">
        <span style={{ color: 'var(--text-muted)' }} className="text-xs font-mono">{lang}</span>
        <button
          onClick={copy}
          style={{ color: 'var(--text-muted)' }}
          className="text-xs hover:text-[var(--text)] transition-colors"
        >
          {copied ? 'コピー済み ✓' : 'コピー'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code style={{ color: '#e6edf3' }} className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
