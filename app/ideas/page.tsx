import { readSearchIndex } from '@/lib/search-index'
import { IdeasClient } from './IdeasClient'

export default async function IdeasPage() {
  const index = await readSearchIndex()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-4xl">
        <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
          DevKnow
        </p>
        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
          個人開発アイデア
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm">
          過去の記事から抽出したアプリアイデア一覧。パターン・スコアで絞り込めます。
        </p>
        <IdeasClient ideas={index.ideas} />
      </div>
    </div>
  )
}
