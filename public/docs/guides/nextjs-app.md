---
title: Next.js × Claude Code ガイド
description: Next.js App Router を使った Web アプリ開発のベストプラクティス。スタック選定からデプロイまで、個人開発で最速で動かすための構成。
emoji: 🌐
category: nextjs
updatedAt: 2026-05-18
---

## 推奨スタック

個人開発で最速・最低コストで動かせる構成です。

| レイヤー | 選択肢 | 理由 |
|----------|--------|------|
| フレームワーク | Next.js 16 (App Router) | Vercel 最適化、フルスタック対応 |
| 言語 | TypeScript | Claude との相性が良い（型情報が補完に効く） |
| スタイリング | Tailwind CSS v4 | ユーティリティファーストで Claude が生成しやすい |
| DB | Neon (Serverless Postgres) | サーバーレス、無料枠あり、接続管理不要 |
| 認証 | iron-session | シンプル、JWT 不要、Cookie ベース |
| 決済 | Stripe | 個人開発のデファクトスタンダード |
| デプロイ | Vercel | push だけでデプロイ、環境変数管理が楽 |
| メール | Resend | API キー1つで送信可能、無料枠 3,000 通/月 |

---

## ディレクトリ構成

App Router の標準構成です。Claude にこの構成を伝えておくと、ファイルの置き場所で迷いません。

```
my-app/
├── app/
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ
│   ├── globals.css         # グローバルスタイル
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       └── signup/route.ts
│   └── (auth)/
│       ├── login/page.tsx
│       └── signup/page.tsx
├── components/             # 再利用コンポーネント
├── lib/                    # ユーティリティ・DB クライアント
│   ├── db.ts               # Neon 接続
│   ├── session.ts          # iron-session 設定
│   └── users.ts            # ユーザー CRUD
├── public/                 # 静的ファイル
├── CLAUDE.md               # Claude への指示
└── middleware.ts           # 認証チェック
```

### 重要な設計方針

- **デフォルトは Server Component**。データ取得・DB アクセスは Server Component で行い、インタラクションが必要な部分のみ `'use client'` にする
- **`lib/` に DB 処理を集約**。API ルートに SQL を直書きしない
- **`middleware.ts` で認証チェック**。各ページで個別にチェックしない

---

## CLAUDE.md テンプレート

```markdown
# プロジェクト名

## スタック
- Next.js 16 App Router + TypeScript
- Tailwind CSS v4（CSS Variables でテーマ管理）
- Neon Serverless Postgres（@neondatabase/serverless）
- iron-session v8 でセッション管理
- Vercel デプロイ

## ルール
- Server Component をデフォルトにする
- 'use client' は必要最小限に留める
- DB アクセスは lib/ に集約し、API ルートから直接 SQL を書かない
- コメントは自明でない箇所のみ（何をするかではなくなぜするかを書く）
- エラーハンドリングは API 境界と外部 I/O のみ

## CSS
- CSS Variables でカラートークンを管理
- var(--text), var(--bg), var(--border), var(--accent) を使う
- ダークモードは .dark クラスで切り替え

## やらないこと
- テストは書かない（MVP フェーズ）
- 管理画面は含めない
- 多言語対応は対象外
```

---

## Claude との開発フロー

### ステップ 1: DB スキーマから始める

最初に DB テーブルの設計を決め、マイグレーション SQL を書いてもらいます。スキーマが固まると、その後の実装が一気にスムーズになります。

```
「以下の要件に合わせて、Postgres の users テーブルの
 CREATE TABLE 文を書いてください。
 
 要件:
 - id (serial primary key)
 - email (unique, not null)
 - password_hash (not null)
 - created_at (timestamptz, default now())
 - stripe_customer_id (nullable)
 - subscribed_until (timestamptz, nullable)」
```

### ステップ 2: lib/ の関数を作る

DB アクセス関数を先に作ると、API ルートの実装が速くなります。

```
「lib/users.ts に以下の関数を実装してください：
 - findUserByEmail(email: string)
 - createUser(email: string, passwordHash: string)
 - updateSubscription(userId: number, until: Date)
 
 Neon の @neondatabase/serverless を使い、
 接続は関数内で都度生成してください（トップレベルで初期化しない）」
```

### ステップ 3: API ルートを作る

```
「lib/users.ts の findUserByEmail と bcryptjs の compare を使って、
 app/api/auth/login/route.ts にログイン API を実装してください。
 iron-session でセッションを保存します。
 セッション型は lib/session.ts の SessionData を使ってください」
```

### ステップ 4: UI を作る

```
「app/login/page.tsx にログインフォームを作ってください。
 既存の app/signup/page.tsx と同じデザインシステムを使い、
 /api/auth/login に POST するフォームです」
```

---

## よくある落とし穴

**`new Stripe()` をトップレベルで初期化しない**

`lib/stripe.ts` でトップレベルに `new Stripe(key)` を書くと、ビルド時に環境変数がなくてクラッシュします。関数内で初期化するか、遅延初期化パターンを使います。

```typescript
// ❌ ビルド時クラッシュ
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// ✅ 遅延初期化
let _stripe: Stripe | null = null
export function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  return _stripe
}
```

**Server Component で `cookies()` を使うときは `await`**

Next.js 16 では `cookies()` が Promise を返します。

```typescript
// ❌ Next.js 16 ではエラー
const cookieStore = cookies()

// ✅
const cookieStore = await cookies()
```

**`params` も `await` が必要**

```typescript
// ❌
export default function Page({ params }: { params: { id: string } }) {

// ✅
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
```

**`React.FormEvent` は React 19 で非推奨**

```typescript
// ❌ React 19 で Hint が出る
async function handleSubmit(e: React.FormEvent) {

// ✅
async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
```

**Neon の接続はリクエストごとに生成する**

Serverless 環境では接続プールが使えないため、トップレベルで `neon()` を呼ぶとコールドスタート時に問題が起きます。

```typescript
// ❌
const sql = neon(process.env.DATABASE_URL!)

// ✅ 関数内で生成
function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}
```
