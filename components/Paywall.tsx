'use client'

import { useState } from 'react'
import { DISCLAIMER_PAYWALL } from '@/lib/disclaimer'

export function Paywall() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'エラーが発生しました')
        return
      }
      window.location.href = data.url
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ border: '1px solid var(--border)', background: 'var(--sidebar-bg)' }}
      className="mx-auto max-w-md rounded-2xl px-8 py-10 text-center"
    >
      <div
        style={{ background: 'var(--hover)' }}
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--accent)' }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 style={{ color: 'var(--text)' }} className="mb-2 text-lg font-bold">
        プロプランで閲覧できます
      </h2>
      <p style={{ color: 'var(--text-muted)' }} className="mb-6 text-sm leading-relaxed">
        過去のダイジェストと個人開発アイデア分析は
        <br />
        プロプランで閲覧できます。今日分は無料です。
      </p>

      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? '処理中...' : 'プランを見る'}
      </button>

      <p style={{ color: 'var(--text-muted)' }} className="mt-4 text-[11px] leading-relaxed">
        {DISCLAIMER_PAYWALL}
      </p>
    </div>
  )
}
