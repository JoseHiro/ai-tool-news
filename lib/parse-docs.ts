import type { IdeaEntry, IdeaPattern, TipEntry } from '@/lib/search-index'

export function parseIdeas(content: string, date: string): IdeaEntry[] {
  const ideas: IdeaEntry[] = []

  // Build pattern list from the summary table (## まとめ), matched by row index
  const patternByIndex: IdeaPattern[] = []
  const summaryMatch = content.match(/## まとめ([\s\S]+?)(?=\n## |\n---|\s*$)/)
  if (summaryMatch) {
    for (const row of summaryMatch[1].split('\n')) {
      if (!/^\|/.test(row) || /---/.test(row) || /パターン|アプリ名/.test(row)) continue
      const cols = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 3) {
        const raw = cols[2]
        let pattern: IdeaPattern = 'その他'
        if (raw.includes('海外→日本')) pattern = '海外→日本'
        else if (raw.includes('日本→海外')) pattern = '日本→海外'
        else if (raw.includes('高すぎ')) pattern = '高すぎる→安価'
        patternByIndex.push(pattern)
      }
    }
  }

  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^### (.+?)｜スコア:\s*(\d+)/)
    if (!match) continue

    const rawHeading = match[1].trim()
    const score = parseInt(match[2])

    // Extract leading emoji and strip "N. " prefix
    const emojiMatch = rawHeading.match(/^([\p{Emoji}‍]+)\s*\d+\.\s*/u)
    const emoji = emojiMatch ? emojiMatch[1].trim() : ''
    const name = rawHeading.replace(/^[\p{Emoji}‍]+\s*\d+\.\s*/u, '').trim()

    // Find summary: first non-empty line after **概要**
    let summary = ''
    for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
      if (lines[j].startsWith('**概要**')) {
        summary = lines[j + 1]?.trim() ?? ''
        break
      }
    }

    // Pattern: from summary table by index, fallback to scanning nearby text
    let pattern: IdeaPattern = patternByIndex[ideas.length] ?? 'その他'
    if (pattern === 'その他') {
      const block = lines.slice(i, Math.min(i + 50, lines.length)).join('\n')
      if (block.includes('海外→日本')) pattern = '海外→日本'
      else if (block.includes('日本→海外')) pattern = '日本→海外'
      else if (block.includes('高すぎ')) pattern = '高すぎる→安価'
    }

    ideas.push({ date, emoji, name, score, pattern, summary })
  }

  return ideas
}

export function parseTips(content: string, date: string): TipEntry[] {
  const tips: TipEntry[] = []

  // Topic = blockquote line right after H1
  const topicMatch = content.match(/^> (.+)$/m)
  const topic = topicMatch ? topicMatch[1].split('—')[0].trim() : ''

  const lines = content.split('\n')
  let inTipsSection = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (/^## .*実践\s*Tips/.test(line) || /^## .*実践Tips/.test(line)) {
      inTipsSection = true
      continue
    }
    if (inTipsSection && /^## /.test(line)) {
      inTipsSection = false
      continue
    }
    if (!inTipsSection) continue

    const tipMatch = line.match(/^### \d+\.\s*(.+)/)
    if (!tipMatch) continue

    const title = tipMatch[1].trim()

    // First non-empty, non-code, non-table line after the heading
    let excerpt = ''
    for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
      const l = lines[j].trim()
      if (l && !l.startsWith('#') && !l.startsWith('```') && !l.startsWith('|') && !l.startsWith('-')) {
        excerpt = l.slice(0, 120)
        break
      }
    }

    tips.push({ date, title, topic, excerpt })
  }

  return tips
}
