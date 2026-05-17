'use client'

import Image from 'next/image'
import Link from 'next/link'

export const SITE_NAME = 'DevKnow'

type BrandMarkProps = {
  variant?: 'sidebar' | 'auth'
}

export function BrandMark({ variant = 'sidebar' }: BrandMarkProps) {
  const auth = variant === 'auth'
  const iconSize = auth ? 44 : 32

  return (
    <Link
      href="/"
      className={
        auth
          ? 'flex flex-row flex-wrap items-center justify-center gap-2.5 transition-opacity hover:opacity-80'
          : 'flex items-center gap-2 transition-opacity hover:opacity-80'
      }
      aria-label={`${SITE_NAME}のトップへ`}
    >
      <Image
        src="/img/icon.webp"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0 rounded-lg object-contain"
        priority
        unoptimized
      />
      <span
        style={{ color: 'var(--text)' }}
        className={
          auth
            ? 'text-lg font-semibold tracking-tight'
            : 'text-sm font-semibold tracking-tight'
        }
      >
        {SITE_NAME}
      </span>
    </Link>
  )
}
