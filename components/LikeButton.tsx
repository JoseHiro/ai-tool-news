'use client'

import { useState } from 'react'

type Props = {
  contentType: 'idea' | 'tip'
  contentDate: string
  contentKey: string
  title: string
  initialLiked: boolean
}

export function LikeButton({ contentType, contentDate, contentKey, title, initialLiked }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [popping, setPopping] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    const next = !liked
    setLiked(next)
    if (next) { setPopping(true); setTimeout(() => setPopping(false), 300) }
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, contentDate, contentKey, title }),
      })
      if (!res.ok) setLiked(!next)
    } catch {
      setLiked(!next)
    }
  }

  return (
    <button
      onClick={toggle}
      title={liked ? 'いいかも済み — 解除する' : 'いいかも！'}
      style={{ color: liked ? '#f43f5e' : 'var(--text-muted)' }}
      className={`flex items-center justify-center rounded-full p-1.5 transition-all hover:bg-[var(--hover)] ${popping ? 'scale-125' : 'scale-100'}`}
    >
      <svg
        width="13" height="13" viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'fill 0.15s ease' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  )
}
