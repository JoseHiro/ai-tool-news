'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'
import { PasswordInput } from '@/components/PasswordInput'

function ResetForm() {
  const params = useSearchParams()
  const router = useRouter()
  const email = params.get('email') ?? ''
  const token = params.get('token') ?? ''
  const expires = params.get('expires') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isValidLink = email && token && expires

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (password !== confirm) { setError('パスワードが一致しません'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, expires: Number(expires), newPassword: password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.push('/login?reset=1')
    } catch {
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidLink) {
    return (
      <div className="space-y-4 text-center">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          無効なリセットリンクです。
        </p>
        <Link href="/forgot-password" style={{ color: 'var(--accent)' }} className="text-sm hover:underline">
          再度リセットを申請する
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label style={{ color: 'var(--text-muted)' }} className="mb-1.5 block text-xs font-medium">
          新しいパスワード
        </label>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
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
        {loading ? '更新中...' : 'パスワードを更新'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div style={{ border: '1px solid var(--border)' }} className="w-full max-w-sm rounded-xl p-8">
        <div className="mb-6 flex justify-center">
          <BrandMark variant="auth" />
        </div>
        <h1 style={{ color: 'var(--text)' }} className="mb-6 text-xl font-bold">
          新しいパスワードを設定
        </h1>
        <Suspense>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
