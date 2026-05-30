import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDigest, getClaudeDigest, getIdeaDigest } from '@/lib/storage'
import { getCasesForDate } from '@/lib/cases'
import { readDocFile, extractSubHeadings, getAdjacentDates } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { getUserLikedKeys, getWeeklyTopLiked } from '@/lib/likes'
import { canViewDate, isSubscribed } from '@/lib/access'
import { DigestContent, parseSectionHeadings } from '@/components/DigestContent'
import { MarkdownDoc } from '@/components/MarkdownDoc'
import { DigestToC } from '@/components/DigestToC'
import { XPostButton } from '@/components/XPostButton'
import { Paywall } from '@/components/Paywall'
import { ContentDisclaimer } from '@/components/ContentDisclaimer'
import { UpdateCard, TipCard, WorkflowCard } from '@/components/NewsCard'
import { IdeaCard } from '@/components/IdeaCard'
import { DigestHero } from '@/components/DigestHero'

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
  const [digest, session, claudeDigest, ideaDigest, claudeDoc, ideasDoc, adjacent, popularTopics, popularIdeas, casesForDate] = await Promise.all([
    getDigest(date),
    getIronSession<SessionData>(await cookies(), sessionOptions),
    getClaudeDigest(date),
    getIdeaDigest(date),
    readDocFile('claude', date),
    readDocFile('ideas', date),
    getAdjacentDates(date),
    getWeeklyTopLiked(5, 'tip').catch(() => []),
    getWeeklyTopLiked(3, 'idea').catch(() => []),
    getCasesForDate(date).catch(() => null),
  ])

  const hasContent = digest || claudeDigest || ideaDigest || claudeDoc || ideasDoc
  if (!hasContent) notFound()

  const todayJST = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const user = session.userId ? await getUserById(session.userId).catch(() => null) : null
  const subscribedUntil = user ? getSubscribedUntil(user) : null
  const canView = canViewDate(session, subscribedUntil, date, todayJST)
  const canLike = session.isAdmin || isSubscribed(subscribedUntil)
  const likedKeysSet = canLike && session.userId ? await getUserLikedKeys(session.userId) : undefined
  const likedKeys = likedKeysSet ? [...likedKeysSet] : undefined

  const heroUpdate = claudeDigest?.updates.find(u => u.importance === 'high')

  const hasCases = casesForDate && casesForDate.length > 0

  const tocSections = claudeDigest ? [
    {
      heading: '🆕 AI ツール最新アップデート',
      sub: [
        ...(claudeDigest.tips.length > 0 ? [{ label: '実践Tips', subIndex: 100 }] : []),
        ...(claudeDigest.workflow ? [{ label: 'ワークフロー', subIndex: 101 }] : []),
      ],
    },
    ...(ideaDigest ? [{ heading: '💰 個人開発アイデア', sub: [] }] : []),
    ...(hasCases ? [{ heading: '🚩 成功事例', sub: [] }] : []),
  ] : [
    ...(claudeDoc ? [{ heading: '🆕 AI ツール最新アップデート', sub: extractSubHeadings(claudeDoc, 'claude') }] : []),
    ...(ideasDoc ? [{ heading: '💰 個人開発アイデア', sub: extractSubHeadings(ideasDoc, 'ideas') }] : []),
    ...(digest ? parseSectionHeadings(digest.content).map(h => ({ heading: h, sub: [] })) : []),
  ]

  return (
    <div className="min-h-full px-8 py-10">
      <div className="mx-auto flex min-h-full max-w-6xl gap-10">
        {/* Main */}
        <div className="min-w-0 flex-1">
          {heroUpdate && <DigestHero update={heroUpdate} date={date} />}

          {canView ? (
            <>
              <div className="mt-6 space-y-8">
                {/* Claude / AI ニュース — JSON優先、なければMD */}
                {claudeDigest ? (
                  <section>
                    <div className="mb-5 flex items-center justify-between" id="section-0">
                      <h2 style={{ color: 'var(--text)' }} className="text-xl font-bold">
                        AI ツール最新アップデート
                      </h2>
                      <Link href="/tips" style={{ color: 'var(--text-muted)' }} className="text-sm transition-colors hover:text-[var(--text)]">
                        すべて見る →
                      </Link>
                    </div>
                    {claudeDigest.updates.filter(u => u !== heroUpdate).length > 0 && (
                      <div className="space-y-2">
                        {claudeDigest.updates.filter(u => u !== heroUpdate).map((u, i) => (
                          <UpdateCard
                            key={i}
                            update={u}
                            contentDate={date}
                            contentKey={`update-${i}`}
                            initialLiked={likedKeys?.includes(`tip:${date}:update-${i}`) ?? false}
                          />
                        ))}
                      </div>
                    )}
                    {claudeDigest.tips.length > 0 && (
                      <>
                        <h3 id="section-0-sub-100" style={{ color: 'var(--text)' }} className="mb-3 mt-6 text-sm font-semibold">⚡ 実践Tips</h3>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {claudeDigest.tips.map((t, i) => (
                            <TipCard
                              key={i}
                              tip={t}
                              contentDate={date}
                              contentKey={`tip-${i}`}
                              initialLiked={likedKeys?.includes(`tip:${date}:tip-${i}`) ?? false}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {claudeDigest.workflow && (
                      <>
                        <h3 id="section-0-sub-101" style={{ color: 'var(--text)' }} className="mb-3 mt-6 text-sm font-semibold">🛠 ワークフロー</h3>
                        <WorkflowCard workflow={claudeDigest.workflow} />
                      </>
                    )}
                  </section>
                ) : claudeDoc ? (
                  <MarkdownDoc content={claudeDoc} type="claude" id="section-0" date={date} likedKeys={likedKeys} />
                ) : null}

                {/* アイデア — JSON優先、なければMD */}
                {ideaDigest ? (
                  <section>
                    <div className="mb-4 flex items-center justify-between" id={`section-${claudeDigest || claudeDoc ? 1 : 0}`}>
                      <h2 style={{ color: 'var(--text)' }} className="text-xl font-bold">
                        個人開発アイデア
                      </h2>
                      <Link href="/ideas" style={{ color: 'var(--text-muted)' }} className="text-sm transition-colors hover:text-[var(--text)]">
                        すべて見る →
                      </Link>
                    </div>
                    <p style={{ color: 'var(--text-muted)' }} className="mb-4 text-sm">{ideaDigest.perspective}</p>
                    <div className="space-y-2">
                      {ideaDigest.ideas.map((idea, i) => {
                        const contentKey = idea.name.toLowerCase().replace(/\s+/g, '-')
                        return (
                          <IdeaCard
                            key={i}
                            idea={idea}
                            contentDate={date}
                            initialLiked={likedKeys?.includes(`idea:${date}:${contentKey}`) ?? false}
                          />
                        )
                      })}
                    </div>
                  </section>
                ) : ideasDoc ? (
                  <MarkdownDoc content={ideasDoc} type="ideas" id={`section-${claudeDoc ? 1 : 0}`} date={date} likedKeys={likedKeys} />
                ) : null}

                {/* 成功事例 */}
                {hasCases && casesForDate && (
                  <section id="section-cases">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 style={{ color: 'var(--text)' }} className="text-xl font-bold">
                        🚩 成功事例
                      </h2>
                      <Link href="/cases" style={{ color: 'var(--text-muted)' }} className="text-sm transition-colors hover:text-[var(--text)]">
                        すべて見る →
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {casesForDate.map((c, i) => {
                        const GRADIENTS = [
                          ['#3b82f6','#60a5fa'],['#8b5cf6','#a78bfa'],['#10b981','#34d399'],
                          ['#f59e0b','#fbbf24'],['#ef4444','#f87171'],['#ec4899','#f472b6'],
                          ['#6366f1','#818cf8'],['#0ea5e9','#38bdf8'],
                        ]
                        const idx = c.name.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % GRADIENTS.length
                        const [from, to] = GRADIENTS[idx]
                        const initial = c.name.replace(/\s/g, '')[0]?.toUpperCase() ?? '?'
                        const hasMetric = c.metricValue > 0
                        const metricColor = c.metricLabel === 'MRR' || c.metricLabel === '売上' ? '#10b981' : '#3b82f6'
                        const boxColor = c.metricDisplay === '複数アプリ運用' ? '#8b5cf6' : '#6b7280'
                        return (
                          <div key={i} style={{ border: '1px solid var(--border)' }} className="flex items-center gap-4 rounded-2xl p-4">
                            <div style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white">
                              {initial}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p style={{ color: 'var(--text)' }} className="mb-1 text-sm font-bold">{c.name}</p>
                              <div className="mb-1.5 flex flex-wrap gap-1">
                                <span style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} className="rounded px-1.5 py-0.5 text-[10px]">
                                  {c.platform === 'mobile' ? 'iOS' : c.platform === 'web' ? 'Web' : c.platform}
                                </span>
                                <span style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }} className="rounded px-1.5 py-0.5 text-[10px]">
                                  {c.category}
                                </span>
                              </div>
                              {c.notes && (
                                <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">{c.notes}</p>
                              )}
                              <p style={{ color: 'var(--text-muted)' }} className="mt-1 text-[11px]">{c.developer}</p>
                            </div>
                            {hasMetric ? (
                              <div className="shrink-0 text-center">
                                <p style={{ color: metricColor }} className="text-[10px] font-semibold uppercase">{c.metricLabel}</p>
                                <p style={{ color: metricColor }} className="text-xl font-bold tabular-nums leading-tight">{c.metricDisplay}</p>
                              </div>
                            ) : (
                              <div style={{ background: `${boxColor}10`, border: `1px solid ${boxColor}25` }}
                                className="shrink-0 rounded-xl px-3 py-2 text-center">
                                <p style={{ color: boxColor }} className="text-xs font-semibold leading-snug">{c.metricDisplay}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )}

                {/* レガシーMDダイジェスト */}
                {digest && (
                  <DigestContent
                    content={digest.content}
                    indexOffset={(claudeDigest || claudeDoc ? 1 : 0) + (ideaDigest || ideasDoc ? 1 : 0)}
                  />
                )}
              </div>
              <div className="mt-8">
                <ContentDisclaimer />
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
          <div
            className="hidden w-72 shrink-0 xl:block"
            style={{
              background: 'var(--bg)',
              margin: '-40px -32px -40px 0',
              padding: '40px 20px 40px 16px',
            }}
          >
            <DigestToC sections={tocSections} popularTopics={popularTopics} popularIdeas={popularIdeas} showModelGuide={!!claudeDigest} />
          </div>
        )}
      </div>
    </div>
  )
}
