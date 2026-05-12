export const dynamic = 'force-dynamic'

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { readDocFile, extractSubHeadings } from '@/lib/docs'
import { sessionOptions, type SessionData } from '@/lib/session'
import { MarkdownDoc } from '@/components/MarkdownDoc'
import { DigestToC } from '@/components/DigestToC'

// LLM imports disabled
// import { getDigest } from '@/lib/storage'
// import { GenerateButton } from '@/components/GenerateButton'
// import { DigestContent, parseSectionHeadings } from '@/components/DigestContent'
// import { XPostButton } from '@/components/XPostButton'

function todayJST() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

export default async function Dashboard() {
  const today = todayJST()
  const [session, claudeDoc, ideasDoc] = await Promise.all([
    getIronSession<SessionData>(await cookies(), sessionOptions),
    readDocFile('claude', today),
    readDocFile('ideas', today),
  ])
  void session

  const hasContent = claudeDoc || ideasDoc
  const tocSections = [
    ...(claudeDoc ? [{ heading: '🆕 Claude / Claude Code アップデート', sub: extractSubHeadings(claudeDoc, 'claude') }] : []),
    ...(ideasDoc ? [{ heading: '💰 個人開発アイデア', sub: extractSubHeadings(ideasDoc, 'ideas') }] : []),
  ]

  if (!hasContent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-8">
        <p style={{ color: 'var(--text)' }} className="text-sm font-medium">
          {formatDate(today)}
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-sm">
          本日のドキュメントがまだありません
        </p>
        <p style={{ color: 'var(--text-muted)' }} className="text-xs">
          public/docs/claude/ または public/docs/ideas/ に {today}.md を追加してください
        </p>
      </div>
    )
  }

  return (
    <div className="px-8 py-10">
      <div className="mx-auto flex max-w-4xl gap-10">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
            Daily Digest
          </p>
          <h1 style={{ color: 'var(--text)' }} className="mb-8 text-2xl font-bold">
            {formatDate(today)}
          </h1>
          <div className="space-y-4">
            {claudeDoc && <MarkdownDoc content={claudeDoc} type="claude" id={`section-0`} />}
            {ideasDoc && <MarkdownDoc content={ideasDoc} type="ideas" id={`section-${claudeDoc ? 1 : 0}`} />}
          </div>
        </div>
        {/* Right ToC */}
        <div className="hidden w-40 shrink-0 xl:block">
          <DigestToC sections={tocSections} />
        </div>
      </div>
    </div>
  )
}
