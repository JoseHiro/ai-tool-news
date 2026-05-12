// Pure parsing functions extracted from MarkdownDoc for testability

export type ClaudeSection = { heading: string; id?: string; body: string }

export type IdeasBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'app'; displayName: string; score?: string; id?: string; body: string }
  | { kind: 'text'; body: string }

export function cleanAppName(raw: string): string {
  const withoutScore = raw.replace(/｜スコア.*$/, '').trim()
  const match = withoutScore.match(/\d/)
  return match?.index != null ? withoutScore.slice(match.index).trim() : withoutScore
}

export function splitByH2(content: string, sectionId?: string): ClaudeSection[] {
  const sections: ClaudeSection[] = []
  let heading = ''
  let id: string | undefined
  let bodyLines: string[] = []
  let h2Count = 0

  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (heading || bodyLines.some(l => l.trim())) {
        sections.push({ heading, id, body: bodyLines.join('\n') })
      }
      heading = line.slice(3).trim()
      id = sectionId ? `${sectionId}-sub-${h2Count++}` : undefined
      bodyLines = []
    } else {
      bodyLines.push(line)
    }
  }
  if (heading || bodyLines.some(l => l.trim())) {
    sections.push({ heading, id, body: bodyLines.join('\n') })
  }
  return sections
}

export function splitIdeas(content: string, sectionId?: string): IdeasBlock[] {
  const blocks: IdeasBlock[] = []
  let h3GlobalIdx = 0
  let currentApp: { displayName: string; score?: string; id?: string; buf: string[] } | null = null
  let textBuf: string[] = []

  function flushText() {
    const t = textBuf.join('\n').trim()
    if (t) blocks.push({ kind: 'text', body: t })
    textBuf = []
  }
  function flushApp() {
    if (currentApp) {
      blocks.push({
        kind: 'app',
        displayName: currentApp.displayName,
        score: currentApp.score,
        id: currentApp.id,
        body: currentApp.buf.join('\n'),
      })
      currentApp = null
    }
  }

  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      flushApp(); flushText()
      blocks.push({ kind: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('### ')) {
      const idx = h3GlobalIdx++
      flushApp()
      if (line.includes('｜スコア')) {
        flushText()
        const raw = line.slice(4).trim()
        currentApp = {
          displayName: cleanAppName(raw),
          score: raw.match(/スコア:\s*(\d+)/)?.[1],
          id: sectionId ? `${sectionId}-sub-${idx}` : undefined,
          buf: [],
        }
      } else {
        textBuf.push(line)
      }
    } else {
      if (currentApp) currentApp.buf.push(line)
      else textBuf.push(line)
    }
  }
  flushApp(); flushText()
  return blocks
}
