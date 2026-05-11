import OpenAI from 'openai'
import type { Digest } from '@/types/digest'
import type { Article } from '@/lib/feeds'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `あなたは「Claude開発者特化ニュースキュレーター兼個人開発メンター」です。
個人開発者（ソロ・副業）向けに、以下のルールで情報をまとめてください。

## 重要なルール
- **情報の正確さを最優先**。不確かな情報は書かない。知らないなら「最新情報なし」と正直に書く
- 手動メモがある場合はそれを最優先で取り上げる
- トーンは親しみやすく、モチベーションが上がる感じ

## セクション1：Claude / Claude Code 最新アップデート
あなたの学習データに含まれる**実際にあったアップデート・発表**のみ記載すること。
- Claude本体の新機能、API変更、モデルアップデート
- Claude Codeの新機能、開発者が実際に使っている便利な使い方
- 情報がない・不確かな場合は「最新情報なし」と書く

## セクション2：個人開発成功事例
**実在するプロダクト**の事例のみ記載すること（架空・曖昧な事例は禁止）。
- 各事例に以下を含める：プロダクト名、カテゴリ（Web / モバイル / 拡張機能）、何をするアプリか、なぜ成功したか
- できれば複数（Web・モバイル・拡張機能から各1件ずつ）
- フォロワーが少なくてもマネタイズできた事例を優先
- 確実に実在すると言えない事例は含めない

## セクション3：今日試すべきこと
- 上記の内容から直接派生した、すぐ実践できるアクション

---

出力は必ず以下のMarkdown形式で返してください。最後の「---XPOST---」以降にX投稿用テキストを1つだけ書いてください。

【Claude開発者向け Daily Digest - {DATE}】

### 🆕 Claude / Claude Code アップデート
- 項目...（なければ「最新情報なし」）

### 💡 個人開発成功事例
- **プロダクト名**（カテゴリ）: 説明...

### 🚀 今日試すべきこと
- 推奨アクション...

---XPOST---
X投稿用テキスト（140〜280文字、ハッシュタグ付き）`

export async function generateDigest(date: string, userNotes: string[], articles: Article[]): Promise<Omit<Digest, 'createdAt'>> {
  const notesSection = userNotes.length > 0
    ? `\n\n【今日の手動入力メモ】\n${userNotes.map((n, i) => `${i + 1}. ${n}`).join('\n')}`
    : ''

  const articlesSection = articles.length > 0
    ? `\n\n【取得した最新記事】\n${articles.map((a) => `- [${a.source}] ${a.title}\n  URL: ${a.url}`).join('\n')}`
    : ''

  const userMessage = `今日の日付: ${date}${notesSection}${articlesSection}

上記の情報をもとに、今日のDaily Digestを生成してください。
- 手動メモがある場合は最優先で取り上げる
- 取得した記事がある場合はその内容を中心にまとめ、URLを参照元として記載する
- 記事・メモがない場合のみ、学習データの知識を使う（その場合は「情報ソースなし」と明記）`

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
