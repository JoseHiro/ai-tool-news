import { describe, it, expect } from 'vitest'
import { cleanAppName, splitByH2, splitIdeas } from '@/lib/markdown'

// ── cleanAppName ────────────────────────────────────────────────────────────

describe('cleanAppName', () => {
  it('removes leading emoji and score suffix', () => {
    expect(cleanAppName('🌮 1. スペイン語レシピアプリ｜スコア: 88')).toBe('1. スペイン語レシピアプリ')
  })

  it('handles multi-character app names with parentheses', () => {
    expect(cleanAppName('📊 2. ハビットトラッカー（日本語×AI版）｜スコア: 85')).toBe('2. ハビットトラッカー（日本語×AI版）')
  })

  it('returns text as-is when no digit is found', () => {
    expect(cleanAppName('AppName without number')).toBe('AppName without number')
  })

  it('removes score even without emoji prefix', () => {
    expect(cleanAppName('3. SomeApp｜スコア: 70')).toBe('3. SomeApp')
  })
})

// ── splitByH2 ───────────────────────────────────────────────────────────────

describe('splitByH2', () => {
  it('splits content into sections by h2 headings', () => {
    const content = `## Section A
Content A

## Section B
Content B`
    const result = splitByH2(content)
    expect(result).toHaveLength(2)
    expect(result[0].heading).toBe('Section A')
    expect(result[1].heading).toBe('Section B')
    expect(result[0].body).toContain('Content A')
  })

  it('assigns sequential IDs when sectionId is provided', () => {
    const content = `## First\nbody\n## Second\nbody`
    const result = splitByH2(content, 'section-0')
    expect(result[0].id).toBe('section-0-sub-0')
    expect(result[1].id).toBe('section-0-sub-1')
  })

  it('omits IDs when no sectionId is given', () => {
    const result = splitByH2('## Heading\nbody')
    expect(result[0].id).toBeUndefined()
  })

  it('captures intro content before first h2 as headingless section', () => {
    const content = `Intro text

## First section
Body`
    const result = splitByH2(content)
    expect(result[0].heading).toBe('')
    expect(result[0].body).toContain('Intro text')
    expect(result[1].heading).toBe('First section')
  })

  it('returns empty array for empty content', () => {
    expect(splitByH2('')).toHaveLength(0)
  })
})

// ── splitIdeas ──────────────────────────────────────────────────────────────

describe('splitIdeas', () => {
  const sample = `## 候補アプリ一覧

### 🌮 1. スペイン語レシピアプリ｜スコア: 88

概要テキスト

### 📊 2. ハビットトラッカー｜スコア: 85

概要テキスト2

### 最短で収益化したいなら

これはアプリ名ではない`

  it('produces h2 blocks for ## headings', () => {
    const blocks = splitIdeas(sample)
    const h2s = blocks.filter(b => b.kind === 'h2')
    expect(h2s).toHaveLength(1)
    expect((h2s[0] as { kind: 'h2'; text: string }).text).toBe('候補アプリ一覧')
  })

  it('produces app blocks for h3 lines containing ｜スコア', () => {
    const blocks = splitIdeas(sample)
    const apps = blocks.filter(b => b.kind === 'app')
    expect(apps).toHaveLength(2)
  })

  it('cleans app display names (removes emoji and score)', () => {
    const apps = splitIdeas(sample).filter(b => b.kind === 'app') as { kind: 'app'; displayName: string; score?: string }[]
    expect(apps[0].displayName).toBe('1. スペイン語レシピアプリ')
    expect(apps[1].displayName).toBe('2. ハビットトラッカー')
  })

  it('extracts score as separate field', () => {
    const apps = splitIdeas(sample).filter(b => b.kind === 'app') as { kind: 'app'; score?: string }[]
    expect(apps[0].score).toBe('88')
    expect(apps[1].score).toBe('85')
  })

  it('assigns IDs using global h3 index when sectionId provided', () => {
    const apps = splitIdeas(sample, 'section-1').filter(b => b.kind === 'app') as { kind: 'app'; id?: string }[]
    expect(apps[0].id).toBe('section-1-sub-0')
    expect(apps[1].id).toBe('section-1-sub-1')
  })

  it('non-app h3 headings become text blocks', () => {
    const blocks = splitIdeas(sample)
    const texts = blocks.filter(b => b.kind === 'text') as { kind: 'text'; body: string }[]
    const hasNonApp = texts.some(t => t.body.includes('最短で収益化したいなら'))
    expect(hasNonApp).toBe(true)
  })
})
