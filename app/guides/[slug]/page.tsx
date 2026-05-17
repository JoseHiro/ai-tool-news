import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { readGuide, getGuides, extractH2Sections, type GuideCategory } from '@/lib/guides'
import { GuideContent } from '@/components/GuideContent'
import { GuideToC } from '@/components/GuideToC'

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

export async function generateStaticParams() {
  const guides = await getGuides()
  return guides.map(g => ({ slug: g.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const guide = await readGuide(slug)
  if (!guide) return {}
  return {
    title: guide.title,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
    },
  }
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = await readGuide(slug)
  if (!guide) notFound()

  const sections = extractH2Sections(guide.content)

  return (
    <div className="px-8 py-10">
      <div className="mx-auto flex max-w-4xl gap-10">
        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Back */}
          <Link
            href="/guides"
            style={{ color: 'var(--text-muted)' }}
            className="mb-8 flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--text)]"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            ガイド一覧
          </Link>

          {/* Title block */}
          <div
            style={{ border: '1px solid var(--border)', background: 'var(--sidebar-bg)' }}
            className="mb-8 rounded-xl p-6"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-4xl leading-none">{guide.emoji}</span>
              <div>
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
                {guide.updatedAt && (
                  <span style={{ color: 'var(--text-muted)' }} className="ml-2 text-[10px]">
                    更新: {guide.updatedAt}
                  </span>
                )}
              </div>
            </div>
            <h1 style={{ color: 'var(--text)' }} className="mb-2 text-xl font-bold">
              {guide.title}
            </h1>
            <p style={{ color: 'var(--text-muted)' }} className="text-sm leading-relaxed">
              {guide.description}
            </p>
          </div>

          {/* Content */}
          <GuideContent content={guide.content} />
        </div>

        {/* ToC */}
        <div className="hidden w-44 shrink-0 xl:block">
          <GuideToC sections={sections} />
        </div>
      </div>
    </div>
  )
}
