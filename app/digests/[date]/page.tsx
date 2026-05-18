import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDigest } from '@/lib/storage'
import { readDocFile, extractSubHeadings, getAdjacentDates } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { getUserLikedKeys } from '@/lib/likes'
import { canViewContent } from '@/lib/access'
import { DigestContent, parseSectionHeadings } from '@/components/DigestContent'
import { MarkdownDoc } from '@/components/MarkdownDoc'
import { DigestToC } from '@/components/DigestToC'
import { XPostButton } from '@/components/XPostButton'
import { GenerateButton } from '@/components/GenerateButton'
import { Paywall } from '@/components/Paywall'
import { ContentDisclaimer } from '@/components/ContentDisclaimer'

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

function extractDescription(content: string | null): string {
  if (!content) return ''
  for (const line of content.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('>') || t.startsWith('|') || t.startsWith('-') || t.startsWith('`') || t.length < 20) continue
    return t.slice(0, 120)
  }
  return ''
}

export async function generateMetadata(
  { params }: { params: Promise<{ date: string }> }
): Promise<Metadata> {
  const { date } = await params
  const [claudeDoc, ideasDoc] = await Promise.all([
    readDocFile('claude', date),
    readDocFile('ideas', date),
  ])
  const title = formatDate(date)
  const description = extractDescription(claudeDoc) || extractDescription(ideasDoc) || 'エンジニア向けデイリーダイジェスト'
  const ogImage = `/api/og?date=${date}&title=${encodeURIComponent(title)}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'article',
      publishedTime: date,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

function formatShort(date: string) {
  const [, m, d] = date.split('-')
  return `${parseInt(m)}月${parseInt(d)}日`
}

export default async function DigestPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params
  const [digest, session, claudeDoc, ideasDoc, adjacent] = await Promise.all([
    getDigest(date),
    getIronSession<SessionData>(await cookies(), sessionOptions),
    readDocFile('claude', date),
    readDocFile('ideas', date),
    getAdjacentDates(date),
  ])

  const hasContent = digest || claudeDoc || ideasDoc
  if (!hasContent) notFound()

  const isAuthed = !!session.userId
  const user = session.userId ? await getUserById(session.userId) : null
  const subscribedUntil = user ? getSubscribedUntil(user) : null
  const canView = canViewContent(session, subscribedUntil)
  const likedKeys = session.userId ? await getUserLikedKeys(session.userId) : undefined

  const tocSections = [
    ...(claudeDoc ? [{ heading: '🆕 Claude / Claude Code アップデート', sub: extractSubHeadings(claudeDoc, 'claude') }] : []),
    ...(ideasDoc ? [{ heading: '💰 個人開発アイデア', sub: extractSubHeadings(ideasDoc, 'ideas') }] : []),
    ...(digest ? parseSectionHeadings(digest.content).map(h => ({ heading: h, sub: [] })) : []),
  ]

  return (
    <div className="px-8 py-10">
      <div className="mx-auto flex max-w-4xl gap-10">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
            DevKnow
          </p>
          <div className="mb-8 flex items-center gap-3">
            <h1 style={{ color: 'var(--text)' }} className="text-2xl font-bold">
              {formatDate(date)}
            </h1>
            <GenerateButton regenerate isAuthed={isAuthed} />
          </div>

          {canView ? (
            <>
              <ContentDisclaimer />
              <div className="mt-6 space-y-4">
                {claudeDoc && <MarkdownDoc content={claudeDoc} type="claude" id="section-0" date={date} likedKeys={likedKeys} />}
                {ideasDoc && <MarkdownDoc content={ideasDoc} type="ideas" id={`section-${claudeDoc ? 1 : 0}`} date={date} likedKeys={likedKeys} />}
                {digest && (
                  <DigestContent
                    content={digest.content}
                    indexOffset={(claudeDoc ? 1 : 0) + (ideasDoc ? 1 : 0)}
                  />
                )}
              </div>
            </>
          ) : (
            <Paywall />
          )}

          {canView && digest?.xPost && (
            <div style={{ borderTop: '1px solid var(--border)' }} className="mt-10 pt-8">
              <p style={{ color: 'var(--text-muted)' }} className="mb-3 text-xs font-semibold uppercase tracking-widest">
                X投稿用テキスト
              </p>
              <XPostButton text={digest.xPost} />
            </div>
          )}

          {/* Prev / Next navigation */}
          <div style={{ borderTop: '1px solid var(--border)' }} className="mt-10 flex items-center justify-between pt-6">
            {adjacent.prev ? (
              <Link
                href={`/digests/${adjacent.prev}`}
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                {formatShort(adjacent.prev)}
              </Link>
            ) : <div />}

            {adjacent.next ? (
              <Link
                href={`/digests/${adjacent.next}`}
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-[var(--hover)] hover:text-[var(--text)]"
              >
                {formatShort(adjacent.next)}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>

        {canView && (
          <div className="hidden w-40 shrink-0 xl:block">
            <DigestToC sections={tocSections} />
          </div>
        )}
      </div>
    </div>
  )
}
