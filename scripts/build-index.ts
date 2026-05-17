import { readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseIdeas } from '../lib/parse-docs'
import { parseTips } from '../lib/parse-docs'
import type { SearchIndex } from '../lib/search-index'

const DOCS_DIR = join(process.cwd(), 'public', 'docs')
const INDEX_PATH = join(process.cwd(), 'public', 'search-index.json')

async function getDates(type: 'ideas' | 'claude'): Promise<string[]> {
  const dir = join(DOCS_DIR, type)
  try {
    const files = await readdir(dir)
    return files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .map(f => f.slice(0, 10))
      .sort()
  } catch {
    return []
  }
}

async function main() {
  const index: SearchIndex = { ideas: [], tips: [], updatedAt: new Date().toISOString() }

  const [ideaDates, tipDates] = await Promise.all([
    getDates('ideas'),
    getDates('claude'),
  ])

  for (const date of ideaDates) {
    const content = await readFile(join(DOCS_DIR, 'ideas', `${date}.md`), 'utf-8')
    index.ideas.push(...parseIdeas(content, date))
  }

  for (const date of tipDates) {
    const content = await readFile(join(DOCS_DIR, 'claude', `${date}.md`), 'utf-8')
    index.tips.push(...parseTips(content, date))
  }

  // Sort: ideas by score desc, tips by date desc
  index.ideas.sort((a, b) => b.score - a.score)
  index.tips.sort((a, b) => b.date.localeCompare(a.date))

  await writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8')
  console.log(`✅ Index built: ${index.ideas.length} ideas, ${index.tips.length} tips`)
}

main().catch(err => { console.error(err); process.exit(1) })
