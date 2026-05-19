'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setDone(true)
    } catch {
      setError('エラーが発生しました。もう一度お試しください。')
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
        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-xl font-bold">
          パスワードをリセット
        </h1>

        {done ? (
          <div className="space-y-4">
            <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
              登録済みのメールアドレスであれば、リセット用リンクをお送りしました。
              メールをご確認ください。
            </p>
            <Link
              href="/login"
              style={{ color: 'var(--accent)' }}
              className="block text-center text-sm hover:underline"
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6 text-sm">
              登録したメールアドレスを入力してください。
            </p>
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
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {loading ? '送信中...' : 'リセットリンクを送信'}
              </button>
            </form>
            <p style={{ color: 'var(--text-muted)' }} className="mt-4 text-center text-xs">
              <Link href="/login" style={{ color: 'var(--accent)' }} className="hover:underline">
                ログインに戻る
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
