'use client'

import { useState } from 'react'

export function GenerateButton({ compact = false, regenerate = false }: { compact?: boolean; regenerate?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/generate-digest', { method: 'POST' })
      if (!res.ok) throw new Error('生成に失敗しました')
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (regenerate) {
    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          className="rounded-md px-3 py-1 text-xs transition hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-50"
        >
          {loading ? '生成中...' : '🔄 再生成'}
        </button>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  if (compact) {
    return (
      <div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{ color: 'var(--text-muted)' }}
          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)] disabled:opacity-50"
        >
          <span className="text-base">{loading ? '⏳' : '⚡'}</span>
          <span>{loading ? '生成中...' : 'Digestを生成'}</span>
        </button>
        {error && <p className="mt-1 px-2 text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? '生成中...' : '今日のDigestを生成'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
