'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

type UserMenuProps = {
  isAuthed: boolean
}

export function UserMenu({ isAuthed }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  if (!isAuthed) {
    return (
      <Link
        href="/login"
        aria-label="ログイン"
        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--sidebar-bg)' }}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
      >
        <UserIcon />
      </Link>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label="アカウントメニュー"
        aria-expanded={open}
        aria-haspopup="menu"
        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--sidebar-bg)' }}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
      >
        <UserIcon />
      </button>

      {open && (
        <div
          role="menu"
          style={{ background: 'var(--sidebar-bg)', border: '1px solid var(--border)' }}
          className="absolute right-0 top-full z-50 mt-2 min-w-[9rem] overflow-hidden rounded-lg py-1 shadow-lg"
        >
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            style={{ color: 'var(--text)' }}
            className="block px-3 py-2 text-sm transition-colors hover:bg-[var(--hover)]"
          >
            アカウント
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            style={{ color: 'var(--text)' }}
            className="block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--hover)]"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  )
}
