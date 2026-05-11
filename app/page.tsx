export const dynamic = 'force-dynamic'

import { getDigest } from '@/lib/storage'
import { GenerateButton } from '@/components/GenerateButton'
import { DigestContent } from '@/components/DigestContent'
import { XPostButton } from '@/components/XPostButton'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

export default async function Dashboard() {
  const today = todayJST()
  const digest = await getDigest(today)

  if (!digest) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8">
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          {formatDate(today)} のDigestはまだありません
        </p>
        <GenerateButton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
        Daily Digest
      </p>
      <div className="mb-8 flex items-center gap-3">
        <h1 style={{ color: 'var(--text)' }} className="text-2xl font-bold">
          {formatDate(today)}
        </h1>
        <GenerateButton regenerate />
      </div>
      <DigestContent content={digest.content} />
      {digest.xPost && (
        <div style={{ borderTop: '1px solid var(--border)' }} className="mt-10 pt-8">
          <p style={{ color: 'var(--text-muted)' }} className="mb-3 text-xs font-semibold uppercase tracking-widest">
            X投稿用テキスト
          </p>
          <XPostButton text={digest.xPost} />
        </div>
      )}
    </div>
  )
}
