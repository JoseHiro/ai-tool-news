'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
      style={{ color: 'var(--text-muted)' }}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-[var(--hover)]"
    >
      <span className="text-base">{dark ? '☀️' : '🌙'}</span>
      <span>{dark ? 'ライトモード' : 'ダークモード'}</span>
    </button>
  )
}
