import { readSearchIndex } from '@/lib/search-index'
import { TipsClient } from './TipsClient'

export default async function TipsPage() {
  const index = await readSearchIndex()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
          DevKnow
        </p>
        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
          Claude Tips
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm">
          過去の記事から抽出した開発効率化 Tips 一覧。日付ごとのテーマで読み返せます。
        </p>
        <TipsClient tips={index.tips} />
      </div>
    </div>
  )
}
