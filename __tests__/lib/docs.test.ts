import { describe, it, expect } from 'vitest'
import { extractSubHeadings } from '@/lib/docs'

const CLAUDE_CONTENT = `# Claude Code アップデート

## 🆕 最近の主なアップデート
### 詳細
内容

## ⚡ 開発効率を上げる実践Tips
### Tip 1
説明

## 🛠 おすすめワークフロー
内容`

const CLAUDE_WITH_CODE_FENCE = `# Claude Code アップデート

## 🆕 今週のアップデート
内容

## ⚡ 実践Tips

\`\`\`markdown
## コーディング規約
## 禁止事項
## ファイル命名
\`\`\`

## 🛠 ワークフロー
内容`

const IDEAS_CONTENT = `# 個人開発アイデア

## 前提：基本知識
テキスト

### 🌮 1. スペイン語レシピアプリ｜スコア: 88
概要

### 📊 2. ハビットトラッカー｜スコア: 85
概要

### 最短で収益化したいなら
これはアプリではない`

describe('extractSubHeadings — claude', () => {
  it('returns h2 headings', () => {
    const result = extractSubHeadings(CLAUDE_CONTENT, 'claude')
    expect(result.map(h => h.label)).toEqual([
      '🆕 最近の主なアップデート',
      '⚡ 開発効率を上げる実践Tips',
      '🛠 おすすめワークフロー',
    ])
  })

  it('uses sequential subIndex starting from 0', () => {
    const result = extractSubHeadings(CLAUDE_CONTENT, 'claude')
    expect(result.map(h => h.subIndex)).toEqual([0, 1, 2])
  })

  it('ignores ## lines inside code fences', () => {
    const result = extractSubHeadings(CLAUDE_WITH_CODE_FENCE, 'claude')
    expect(result.map(h => h.label)).toEqual([
      '🆕 今週のアップデート',
      '⚡ 実践Tips',
      '🛠 ワークフロー',
    ])
    expect(result.map(h => h.subIndex)).toEqual([0, 1, 2])
  })
})

describe('extractSubHeadings — ideas', () => {
  it('returns only h3 lines containing ｜スコア', () => {
    const result = extractSubHeadings(IDEAS_CONTENT, 'ideas')
    expect(result).toHaveLength(2)
  })

  it('cleans app name labels', () => {
    const result = extractSubHeadings(IDEAS_CONTENT, 'ideas')
    expect(result[0].label).toBe('1. スペイン語レシピアプリ')
    expect(result[1].label).toBe('2. ハビットトラッカー')
  })

  it('uses global h3 index for subIndex', () => {
    const result = extractSubHeadings(IDEAS_CONTENT, 'ideas')
    // 前提セクションにh3はない。最初のh3(index=0)が app entry
    expect(result[0].subIndex).toBe(0)
    expect(result[1].subIndex).toBe(1)
    // 非appのh3(最短で収益化...)はindex=2だが返り値には含まれない
  })

  it('excludes non-app h3 headings', () => {
    const result = extractSubHeadings(IDEAS_CONTENT, 'ideas')
    const labels = result.map(h => h.label)
    expect(labels.every(l => !l.includes('最短で'))).toBe(true)
  })
})
