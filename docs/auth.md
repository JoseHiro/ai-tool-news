# Auth & Access Control 仕様書

## 1. ユーザー種別と権限

| 種別 | 条件 | コンテンツアクセス | 識別方法 |
|------|------|-------------------|---------|
| 管理者 | `email === ADMIN_EMAIL` | ✅ 全て | セッションの `isAdmin: true` |
| サブスクライバー | `subscribed_until > now()` | ✅ 全て | DB の `subscribed_until` |
| 無料ユーザー | ログイン済み、上記以外 | ❌ ペイウォール表示 | 上記に非該当 |
| 未ログイン | セッションクッキーなし | ❌ `/login` にリダイレクト | middleware で検出 |

---

## 2. 認証フロー

### ログイン
```
POST /api/auth/login
  → seedAdminIfNeeded()       # DBが空なら ADMIN_EMAIL/ADMIN_PASSWORD でユーザー作成
  → findUserByEmail(email)    # DB照合
  → bcrypt.compare()          # パスワード検証
  → session.isAdmin = isAdmin(email)  # 管理者フラグをセッションに保存
  → session.save()            # iron-session で暗号化クッキー発行
  → window.location.href='/'  # クライアント側でハードナビゲーション
```

### サインアップ
```
POST /api/auth/signup
  → validateSignupInput()     # email形式・パスワード8文字以上・確認一致
  → findUserByEmail()         # 重複チェック（409 Conflict）
  → bcrypt.hash(password, 10) # パスワードハッシュ化
  → createUser()              # DB挿入
  → session.isAdmin = isAdmin(email)  # 管理者フラグ（通常は false）
  → session.save()            # 自動ログイン
  → window.location.href='/'
```

### ログアウト
```
POST /api/auth/logout
  → session.destroy()         # クッキー削除
```

---

## 3. セッション構造

```typescript
interface SessionData {
  userId?:  number   // users.id
  email?:   string   // users.email
  isAdmin?: boolean  // email === ADMIN_EMAIL
}
```

- クッキー名: `digest-auth`
- 暗号化: iron-session（AES-256-GCM）
- 有効期限: 30日（`maxAge: 60 * 60 * 24 * 30`）
- `SESSION_SECRET` 環境変数で署名鍵を設定（未設定時は開発用フォールバック）

---

## 4. アクセス制御ロジック

### `lib/access.ts` の関数一覧

| 関数 | 引数 | 戻り値 | 用途 |
|------|------|--------|------|
| `isAdmin(email)` | `string \| undefined` | `boolean` | 管理者判定（大文字小文字無視） |
| `isSubscribed(subscribedUntil)` | `Date \| null \| undefined` | `boolean` | サブスク有効判定 |
| `canViewContent(session, subscribedUntil?)` | `SessionData, Date?` | `boolean` | コンテンツ表示可否 |
| `getAccessLevel(session, subscribedUntil?)` | `SessionData, Date?` | `'admin' \| 'subscriber' \| 'free'` | アクセスレベル取得 |

### `canViewContent` の判定ロジック

```
session.userId が未定義     → false（未ログイン）
session.isAdmin === true   → true（管理者）
subscribedUntil > now()    → true（サブスク有効）
それ以外                   → false（無料ユーザー）
```

---

## 5. ミドルウェア

`middleware.ts` — すべてのリクエストに適用。

```
公開パス（/login, /signup, /api/auth/*）→ スルー
digest-auth クッキーが存在しない         → /login にリダイレクト
digest-auth クッキーが存在する           → スルー（ページ側でフル検証）
```

> **注意**: ミドルウェアはクッキーの存在のみを確認（Edge Runtime で動作）。
> 暗号署名の検証はページ側の `getIronSession()` が担う。

---

## 6. DB スキーマ（users テーブル）

```sql
CREATE TABLE users (
  id                     SERIAL PRIMARY KEY,
  email                  TEXT UNIQUE NOT NULL,
  password_hash          TEXT NOT NULL,         -- bcrypt ハッシュ
  stripe_customer_id     TEXT,                  -- Stripe 連携後に設定
  stripe_subscription_id TEXT,                  -- Stripe 連携後に設定
  subscribed_until       TIMESTAMPTZ,           -- NULL = 無料, 未来 = 有効
  created_at             TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. 環境変数

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | Neon Postgres 接続文字列 |
| `SESSION_SECRET` | ✅（本番） | iron-session の暗号化キー（32文字以上） |
| `ADMIN_EMAIL` | ✅ | 管理者のメールアドレス |
| `ADMIN_PASSWORD` | ✅ | 管理者の初期パスワード（DB空の場合に自動登録） |
| `STRIPE_SECRET_KEY` | 🔜 未実装 | Stripe サブスクリプション連携用 |
| `STRIPE_WEBHOOK_SECRET` | 🔜 未実装 | Stripe Webhook 署名検証用 |

---

## 8. Stripe 連携（実装済み）

```
ユーザーが「プランを見る」をクリック
  → POST /api/stripe/checkout
  → Stripe Checkout セッション作成（metadata に userId を埋め込み）
  → stripe-hosted の支払いページへリダイレクト
  → 支払い完了 → /stripe/success にリダイレクト
  → Stripe が POST /api/stripe/webhook を叩く（セッション不要・公開パス）
  → stripe.webhooks.constructEvent で署名検証
  → checkout.session.completed: updateSubscription() で subscribed_until を更新
  → customer.subscription.updated: 更新時に subscribed_until を延長
  → customer.subscription.deleted: expireSubscription() で即時無効化
```

### Stripe セットアップ手順

1. [Stripe Dashboard](https://dashboard.stripe.com) でサブスクリプション商品・価格を作成
2. Webhook エンドポイントを登録: `https://your-domain.vercel.app/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. 以下の環境変数を設定:

| 変数名 | 取得場所 |
|--------|---------|
| `STRIPE_SECRET_KEY` | Dashboard → API keys → Secret key |
| `STRIPE_PRICE_ID` | Dashboard → Products → 価格の ID（`price_xxx`） |
| `STRIPE_WEBHOOK_SECRET` | Dashboard → Webhooks → Signing secret |

### ローカルテスト（Stripe CLI）

```bash
# Stripe CLI をインストール後
stripe listen --forward-to localhost:3000/api/stripe/webhook
# 別ターミナルでテストイベントを送信
stripe trigger checkout.session.completed
```

---

## 9. テスト

`__tests__/lib/access.test.ts` — 18テスト

| テストケース | 確認内容 |
|---|---|
| isAdmin | 一致・大文字小文字・不一致・undefined・未設定 |
| isSubscribed | 未来・過去・null・undefined |
| canViewContent | 未ログイン・管理者・サブスク有効・無料・サブスク切れ |
| getAccessLevel | 各種別の戻り値 |
