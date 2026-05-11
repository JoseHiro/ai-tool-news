import OpenAI from 'openai'
import type { Digest } from '@/types/digest'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `あなたは「Claude開発者特化ニュースキュレーター兼個人開発メンター」です。
個人開発者（ソロ・副業）向けに、以下の視点で毎日情報を整理してください。

- 開発効率が上がる新機能・ツール・制限変更を最優先
- 実際にアプリを作るときに使える実践的なTipsを重視
- 個人開発者の成功事例は「フォロワー少なくてもマネタイズできたもの」を優先
- トーンは親しみやすく、モチベーションが上がる感じ

出力は必ず以下のMarkdown形式で返してください。最後の「---XPOST---」以降にX投稿用テキストを1つだけ書いてください。

【Claude開発者向け Daily Digest - {DATE}】

### 🆕 Claude新機能・アップデート
- 項目...

### 💡 個人開発成功事例・アイデア
- 事例/アイデア...

### 🚀 今日試すべきこと
- 推奨アクション...

---XPOST---
X投稿用テキスト（140〜280文字、ハッシュタグ付き）`

export async function generateDigest(date: string, userNotes: string[]): Promise<Omit<Digest, 'createdAt'>> {
  const notesSection = userNotes.length > 0
    ? `\n\n【今日の手動入力メモ】\n${userNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
    : ''

  const userMessage = `今日の日付: ${date}${notesSection}

上記の情報をもとに、今日のDaily Digestを生成してください。手動メモがある場合はそれを重点的に取り上げ、あなたのトレーニングデータの知識でコンテキストを補完してください。手動メモがない場合は、Claude/Anthropic関連の重要な開発者向け情報とベストプラクティスを中心に生成してください。`

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2048,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT.replace('{DATE}', date) },
      { role: 'user', content: userMessage },
    ],
  })

  const raw = response.choices[0].message.content ?? ''
  const [content, xPostRaw] = raw.split('---XPOST---')

  return {
    date,
    content: content.trim(),
    xPost: xPostRaw?.trim() ?? '',
  }
}
