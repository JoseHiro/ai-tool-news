'use client'

import { useState } from 'react'

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // portal URL fetch failed
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
      className="w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--hover)] disabled:opacity-60"
    >
      {loading ? '処理中...' : 'プランを管理する →'}
    </button>
  )
}
