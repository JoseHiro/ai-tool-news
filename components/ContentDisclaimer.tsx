import Link from 'next/link'
import { DISCLAIMER_SHORT } from '@/lib/disclaimer'

type ContentDisclaimerProps = {
  variant?: 'article' | 'sidebar'
}

export function ContentDisclaimer({ variant = 'article' }: ContentDisclaimerProps) {
  if (variant === 'sidebar') {
    return (
      <p style={{ color: 'var(--text-muted)' }} className="mb-3 px-2 text-[10px] leading-relaxed">
        {DISCLAIMER_SHORT}{' '}
        <Link
          href="/terms"
          className="underline underline-offset-2 transition-colors hover:text-[var(--text)]"
        >
          詳細
        </Link>
      </p>
    )
  }

  return (
    <aside
      style={{ borderTop: '1px solid var(--border)' }}
      className="mt-10 pt-6"
      aria-label="コンテンツに関する注意"
    >
      <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
        {DISCLAIMER_SHORT}{' '}
        <Link
          href="/terms"
          className="underline underline-offset-2 transition-colors hover:text-[var(--text)]"
        >
          免責事項
        </Link>
      </p>
    </aside>
  )
}
