import Link from 'next/link'
import type { Digest } from '@/types/digest'

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

function preview(content: string, chars = 180) {
  const plain = content.replace(/[#*`>\-]/g, '').replace(/\n+/g, ' ')
  return plain.length > chars ? plain.slice(0, chars) + '...' : plain
}

export function DigestCard({ digest, featured = false }: { digest: Digest; featured?: boolean }) {
  return (
    <Link
      href={`/digests/${digest.date}`}
      className={`block rounded-xl border transition hover:shadow-md ${
        featured
          ? 'border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30'
          : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
      } p-5`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${
            featured ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'
          }`}
        >
          {featured ? '本日' : '過去のDigest'}
        </span>
        <span className="text-xs text-zinc-400">{formatDate(digest.date)}</span>
      </div>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
        {preview(digest.content)}
      </p>
      <p className="mt-3 text-xs font-medium text-violet-600 dark:text-violet-400">全文を読む →</p>
    </Link>
  )
}
