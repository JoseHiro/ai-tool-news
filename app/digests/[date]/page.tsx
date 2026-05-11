import { notFound } from 'next/navigation'
import { getDigest } from '@/lib/storage'
import { DigestContent } from '@/components/DigestContent'
import { XPostButton } from '@/components/XPostButton'
import { GenerateButton } from '@/components/GenerateButton'

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

export default async function DigestPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const digest = await getDigest(date)
  if (!digest) notFound()

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
        Daily Digest
      </p>
      <div className="mb-8 flex items-center gap-3">
        <h1 style={{ color: 'var(--text)' }} className="text-2xl font-bold">
          {formatDate(date)}
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
