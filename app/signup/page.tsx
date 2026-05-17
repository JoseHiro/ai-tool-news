'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { PasswordInput } from '@/components/PasswordInput'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirm }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      window.location.href = '/'
    } catch {
      setError('アカウント作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-8">
      <div style={{ border: '1px solid var(--border)' }} className="w-full max-w-sm rounded-xl p-8">
        <div className="mb-6 flex justify-center">
          <BrandMark variant="auth" />
        </div>
        <h1 style={{ color: 'var(--text)' }} className="mb-6 text-xl font-bold">
          アカウント作成
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="mb-1.5 block text-xs font-medium">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              style={{ background: 'var(--sidebar-bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="mb-1.5 block text-xs font-medium">
              パスワード（8文字以上）
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ color: 'var(--text-muted)' }} className="mb-1.5 block text-xs font-medium">
              パスワード（確認）
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? '作成中...' : 'アカウントを作成'}
          </button>
        </form>
        <p style={{ color: 'var(--text-muted)' }} className="mt-4 text-center text-xs">
          すでにアカウントをお持ちですか？{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }} className="hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
