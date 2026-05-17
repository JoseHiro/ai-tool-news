'use client'

function LogoutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function LogoutButton({ email }: { email: string }) {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.reload()
  }

  return (
    <button
      onClick={handleLogout}
      title={`ログアウト (${email})`}
      style={{ color: 'var(--text-muted)' }}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
    >
      <span className="min-w-0 flex-1 truncate text-left">ログアウト</span>
      <LogoutIcon />
    </button>
  )
}
