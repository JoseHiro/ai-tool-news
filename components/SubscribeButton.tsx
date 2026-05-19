'use client'

import { useState } from 'react'

export function SubscribeButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'エラーが発生しました')
        return
      }
      if (data.url) window.location.href = data.url
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-500">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? '処理中...' : 'プロプランに登録する →'}
      </button>
    </div>
  )
}
