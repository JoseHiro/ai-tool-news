import { notFound } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getDigest } from '@/lib/storage'
import { readDocFile, extractSubHeadings } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { DigestContent, parseSectionHeadings } from '@/components/DigestContent'
import { MarkdownDoc } from '@/components/MarkdownDoc'
import { DigestToC } from '@/components/DigestToC'
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
  const [digest, session, claudeDoc, ideasDoc] = await Promise.all([
    getDigest(date),
    getIronSession<SessionData>(await cookies(), sessionOptions),
    readDocFile('claude', date),
    readDocFile('ideas', date),
  ])

  const hasContent = digest || claudeDoc || ideasDoc
  if (!hasContent) notFound()

  const isAuthed = !!session.userId

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
            Daily Digest
          </p>
          <div className="mb-8 flex items-center gap-3">
            <h1 style={{ color: 'var(--text)' }} className="text-2xl font-bold">
              {formatDate(date)}
            </h1>
            <GenerateButton regenerate isAuthed={isAuthed} />
          </div>
          <div className="space-y-4">
            {claudeDoc && <MarkdownDoc content={claudeDoc} type="claude" id="section-0" />}
            {ideasDoc && <MarkdownDoc content={ideasDoc} type="ideas" id={`section-${claudeDoc ? 1 : 0}`} />}
            {digest && (
              <DigestContent
                content={digest.content}
                indexOffset={(claudeDoc ? 1 : 0) + (ideasDoc ? 1 : 0)}
              />
            )}
          </div>
          {digest?.xPost && (
            <div style={{ borderTop: '1px solid var(--border)' }} className="mt-10 pt-8">
              <p style={{ color: 'var(--text-muted)' }} className="mb-3 text-xs font-semibold uppercase tracking-widest">
                X投稿用テキスト
              </p>
              <XPostButton text={digest.xPost} />
            </div>
          )}
        </div>
        {/* Right ToC */}
        <div className="hidden w-40 shrink-0 xl:block">
          <DigestToC sections={tocSections} />
        </div>
      </div>
    </div>
  )
}
