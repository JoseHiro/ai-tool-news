import type { Metadata } from 'next'
import Link from 'next/link'
import { getGuides, type GuideCategory } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'ガイド',
  description: 'Claude × 個人開発のベストプラクティスガイド集',
}

const CATEGORY_LABEL: Record<GuideCategory, string> = {
  workflow: 'ワークフロー',
  nextjs: 'Next.js',
  'react-native': 'React Native',
}

const CATEGORY_COLOR: Record<GuideCategory, string> = {
  workflow: '#3b82f6',
  nextjs: '#8b5cf6',
  'react-native': '#10b981',
}

export default async function GuidesPage() {
  const guides = await getGuides()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
            Guides
          </p>
          <h1 style={{ color: 'var(--text)' }} className="mb-3 text-2xl font-bold">
            開発ガイド
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
            Claude Code を使った個人開発のベストプラクティス。<br />
            仕様の立て方から、スタック選定・実装フローまで。
          </p>
        </div>

        {/* Guide cards */}
        <div className="space-y-3">
          {guides.map(guide => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{ border: '1px solid var(--border)' }}
              className="group flex items-start gap-5 rounded-xl p-5 transition-colors hover:bg-[var(--hover)]"
            >
              <span className="text-3xl leading-none mt-0.5">{guide.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <h2 style={{ color: 'var(--text)' }} className="text-sm font-semibold">
                    {guide.title}
                  </h2>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      color: CATEGORY_COLOR[guide.category],
                      background: `${CATEGORY_COLOR[guide.category]}18`,
                      border: `1px solid ${CATEGORY_COLOR[guide.category]}40`,
                    }}
                  >
                    {CATEGORY_LABEL[guide.category]}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">
                  {guide.description}
                </p>
              </div>
              <span
                style={{ color: 'var(--text-muted)' }}
                className="shrink-0 text-xs transition-colors group-hover:text-[var(--text)] mt-0.5"
              >
                読む →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
