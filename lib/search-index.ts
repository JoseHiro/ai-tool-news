import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export type IdeaPattern = '海外→日本' | '日本→海外' | '高すぎる→安価' | 'その他'

export type IdeaEntry = {
  date: string
  emoji: string
  name: string
  score: number
  pattern: IdeaPattern
  summary: string
}

export type TipEntry = {
  date: string
  title: string
  topic: string
  excerpt: string
}

export type SearchIndex = {
  ideas: IdeaEntry[]
  tips: TipEntry[]
  updatedAt: string
}

const INDEX_PATH = join(process.cwd(), 'public', 'search-index.json')

export async function readSearchIndex(): Promise<SearchIndex> {
  try {
    const raw = await readFile(INDEX_PATH, 'utf-8')
    return JSON.parse(raw) as SearchIndex
  } catch {
    return { ideas: [], tips: [], updatedAt: '' }
  }
}
