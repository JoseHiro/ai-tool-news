import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'

export type GuideCategory = 'workflow' | 'nextjs' | 'react-native'

export type GuideMetadata = {
  slug: string
  title: string
  description: string
  emoji: string
  category: GuideCategory
  updatedAt: string
  order: number
}

export type Guide = GuideMetadata & { content: string }

const GUIDES_DIR = join(process.cwd(), 'public', 'docs', 'guides')

const CATEGORY_ORDER: Record<GuideCategory, number> = {
  workflow: 0,
  nextjs: 1,
  'react-native': 2,
}

export async function getGuides(): Promise<GuideMetadata[]> {
  let files: string[]
  try {
    files = await readdir(GUIDES_DIR)
  } catch {
    return []
  }
  const guides = await Promise.all(
    files
      .filter(f => f.endsWith('.md'))
      .map(async f => {
        const raw = await readFile(join(GUIDES_DIR, f), 'utf-8')
        const { data } = matter(raw)
        const category = (data.category ?? 'workflow') as GuideCategory
        return {
          slug: f.slice(0, -3),
          title: data.title ?? f.slice(0, -3),
          description: data.description ?? '',
          emoji: data.emoji ?? '📖',
          category,
          updatedAt: data.updatedAt ?? '',
          order: CATEGORY_ORDER[category] ?? 99,
        } as GuideMetadata
      })
  )
  return guides.sort((a, b) => a.order - b.order)
}

export async function readGuide(slug: string): Promise<Guide | null> {
  try {
    const raw = await readFile(join(GUIDES_DIR, `${slug}.md`), 'utf-8')
    const { data, content } = matter(raw)
    const category = (data.category ?? 'workflow') as GuideCategory
    return {
      slug,
      title: data.title ?? slug,
      description: data.description ?? '',
      emoji: data.emoji ?? '📖',
      category,
      updatedAt: data.updatedAt ?? '',
      order: CATEGORY_ORDER[category] ?? 99,
      content,
    }
  } catch {
    return null
  }
}

export function extractH2Sections(content: string): string[] {
  return content
    .split('\n')
    .filter(l => /^## /.test(l))
    .map(l => l.slice(3).trim())
}
