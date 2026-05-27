import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

export type DocType = 'ideas' | 'claude'

export async function readDocFile(type: DocType, date: string): Promise<string | null> {
  const filePath = join(process.cwd(), 'public', 'docs', type, `${date}.md`)
  try {
    return await readFile(filePath, 'utf-8')
  } catch {
    return null
  }
}

export async function getDocDates(): Promise<string[]> {
  const dateSet = new Set<string>()
  for (const type of ['claude', 'ideas'] as DocType[]) {
    const mdDir = join(process.cwd(), 'public', 'docs', type)
    try {
      const files = await readdir(mdDir)
      files
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .forEach(f => dateSet.add(f.slice(0, 10)))
    } catch { /* dir doesn't exist */ }

    const jsonDir = join(process.cwd(), 'public', 'data', type)
    try {
      const files = await readdir(jsonDir)
      files
        .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
        .forEach(f => dateSet.add(f.slice(0, 10)))
    } catch { /* dir doesn't exist */ }
  }
  return [...dateSet].sort().reverse()
}

export async function getAdjacentDates(date: string): Promise<{ prev: string | null; next: string | null }> {
  const dates = await getDocDates() // sorted desc
  const idx = dates.indexOf(date)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: dates[idx + 1] ?? null,  // older
    next: dates[idx - 1] ?? null,  // newer
  }
}

export type SubHeading = { label: string; subIndex: number }

export function extractSubHeadings(content: string, type?: DocType): SubHeading[] {
  if (type !== 'ideas') {
    const lines = content.split('\n')
    let inCode = false
    const headings: SubHeading[] = []
    let subIndex = 0
    for (const l of lines) {
      if (l.startsWith('```')) { inCode = !inCode; continue }
      if (!inCode && /^## /.test(l)) {
        const label = l.slice(3).trim()
        if (label) headings.push({ label, subIndex: subIndex++ })
      }
    }
    return headings
  }
  // ideas: h3 app entries only, using global h3 index to match MarkdownDoc IDs
  const allH3 = content.split('\n').filter(l => /^### /.test(l))
  return allH3.reduce<SubHeading[]>((acc, l, i) => {
    if (!l.includes('｜スコア')) return acc
    const raw = l.slice(4).trim().replace(/｜スコア.*$/, '').trim()
    const match = raw.match(/\d/)
    const label = match?.index != null ? raw.slice(match.index).trim() : raw
    if (label) acc.push({ label, subIndex: i })
    return acc
  }, [])
}
