'use client'

import { useState } from 'react'

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

export function PasswordInput({ className, style, ...props }: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        style={{ background: 'var(--sidebar-bg)', color: 'var(--text)', border: '1px solid var(--border)', ...style }}
        className={`w-full rounded-lg py-2.5 pl-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)] ${className ?? ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{ color: 'var(--text-muted)' }}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70"
        aria-label={visible ? 'パスワードを隠す' : 'パスワードを表示'}
      >
        {visible ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  )
}
