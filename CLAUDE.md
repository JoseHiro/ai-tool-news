@AGENTS.md

---

## Daily Digest 生成仕様

毎日 `public/data/claude/[YYYY-MM-DD].json` と `public/data/ideas/[YYYY-MM-DD].json` の2ファイルを生成する。
日付は JST（UTC+9）の当日。出力は必ず **valid JSON のみ**（コードブロック・説明文は不要）。

---

### 生成フロー（必須）

1. **Grok リサーチ結果があれば最初に貼り付ける**（なければ学習データで補う）
2. **`public/data/ideas/registry.md` を読んで**使用済みテーマ・ターゲット・競合・ドメインを確認する
3. 今日使う組み合わせを宣言してから生成する:
   ```
   今日の組み合わせ:
   - direction: overseas-to-japan × N, japan-to-overseas × N, cheaper-alternative × N
   - platform: web × N, mobile × N, extension × N, cli × N
   - ターゲット層: [具体的に]
   - ドメイン: [前回と被らないもの]
   ```
4. 生成後に `registry.md` へ今日の内容を追記する

---

### Claude Code セッション用プロンプト

新しいセッションで以下をそのまま貼り付けて実行する:

```
【Grok リサーチ結果】（あれば以下に貼る。なければ削除してよい）
---
（ここに Grok 検索結果を貼り付け）
---

今日（JST）の Daily Digest を生成して public/data/claude/[date].json と public/data/ideas/[date].json に保存して。
スキーマと品質ルールは CLAUDE.md に記載されている。
生成前に public/data/ideas/registry.md を読んで被りを確認すること。
生成後に registry.md を更新すること。
```

---

### Grok テンプレート

毎日の生成前に以下を Grok に投げる。結果をそのままセッションに貼り付けて使う。

---

#### 🔧 テンプレートA — AI ツール最新情報（ニュース用）

```
以下を X（Twitter）でリアルタイム検索して、今日の日付のものだけ教えてください。

【対象ツール】
Claude / Cursor / Codex / GitHub Copilot / Windsurf / Gemini Code / Grok build

【探すもの】
1. 新機能・リリース情報（公式アカウントや開発者の投稿）
2. 実際に使っているエンジニアのベストプラクティス・Tips（いいね50以上）
3. 初心者でもベテランでも使える便利な使い方の発見

【除外】
- 求人・採用情報
- 憶測・未確認のリーク
- いいねが少なく信頼性が低い投稿

結果は「ツール名 / 内容 / 投稿者 / URL」の形式でまとめてください。
```

---

#### 💡 テンプレートB — 個人開発成功事例（アイデア用）

```
以下の条件で X をリアルタイム検索して、実在が確認できる個人開発の成功事例を15件以上教えてください。
件数が少ない場合は検索期間を直近1ヶ月まで広げて補ってください。

【探すもの】
- App Store / Google Play にリリース済みのアプリを持つ個人開発者
- MRR・収益・ダウンロード数などの具体的な数字を公開している人
- 日本人・外国人どちらも可（両方バランスよく）
- Web アプリ・Chrome 拡張・Mac アプリも含める

【信頼性フィルター（重要）】
以下をすべて満たす投稿のみ採用する:
- App Store / Play Store の実際のリンクがある、またはスクリーンショットがある
- 具体的な数字（$〇〇 MRR、〇万DL、レビュー〇件など）が明記されている
- アカウントに過去の投稿履歴があり、同じアプリについて複数回投稿している
- 「もうすぐリリース」「準備中」ではなく既にリリース済み

【除外（フェイク防止）】
- 数字の根拠がない「うまくいっています」系
- 新規アカウントや投稿が1件しかない
- アプリ名や URL を出していない
- アフィリエイト・宣伝目的の投稿

結果は以下の形式で15件以上:
「アプリ名 / プラットフォーム / カテゴリ / 数字 / 開発者 @xxx / URL」
```

---

#### 🔍 テンプレートC（リサーチミックス）— 市場の多角調査

※ **このテンプレートは A・B と完全に独立した検索です。前の検索結果は一切参照せず、新しいリサーチとして回答してください。**

今日のパラメータ（毎日変える）:
```
カテゴリ: [例: 健康&フィットネス / ライフスタイル / 写真&ビデオ / 教育 / ゲーム]
ニッチ:   [例: 釣り / ボードゲーム / 御朱印 / 登山 / 手芸 / キャンプ / 鉄道]
```

```
以下の4セクションをそれぞれ独立して調査してください。前の検索とは無関係です。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【セクション1: App Store カテゴリ調査】
対象カテゴリ: [上記カテゴリを入れる]

App Store（日本・米国）のトップ有料 / トップセールス上位10件を教えてください。
各アプリ: アプリ名 / 価格 / 評価数 / 概要1行 / 個人開発者が入れる隙間があるか
日本と米国でランキングが大きく違うものは特に注目。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【セクション2: ユーザーの不満・要望】
X をリアルタイム検索して「こんなアプリが欲しい」「〇〇が使いにくい」という声を探してください。
条件: いいね20以上 / 個人開発で解決できる規模
結果: 不満の内容 / 対象カテゴリ / いいね数 / ✅ 個人開発で解決できるか
10件以上出してください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【セクション3: 海外ヒット・日本未進出】
米国 App Store で評価数1,000以上・評価4.0以上だが、日本語特化版が存在しないアプリを5件。
結果: アプリ名 / 米国評価数 / 価格 / 日本版がない理由 / 日本で作るときの課題

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【セクション4: ニッチコミュニティ調査】
対象ニッチ: [上記ニッチを入れる]

このニッチで:
1. 現在使われているアプリ（評価数・価格）
2. コミュニティ（Reddit / X / Discord）で出る不満・要望
3. 「スプレッドシート・LINE・紙」で代用している非アプリ行動
4. 個人開発で作れそうな解決策

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---A
今日（2026-05-26）のX検索結果まとめ
Grok Build

Grok Build / Grok Build BetaがSuperGrokとX Premium+ユーザー向けに公開。Plan Mode、Imagineによる画像・動画生成、CLIでのautomation/orchestrator構築が可能に / @teslaownersSV / https://x.com/teslaownersSV/status/2059335581877031052
Grok Build / Grok Build v0.2.0 updateリリース。短期間で大幅改善 / @XFreeze / https://x.com/XFreeze/status/2059324720789504377

Cursor

Cursor / CursorのAPI関連制限（自作コードのホスティング不可）の更新情報 / @jpschroeder / https://x.com/jpschroeder/status/2059319949240271299 (Likes 200)
Cursor / Remodex内でCursor AI CLIが近日使用可能に（SSH + Terminal機能） / @emanueledpt / https://x.com/emanueledpt/status/2059282394130059493 (Likes 50)

Claude / Codex

Codex / App shots（画面キャプチャ）を積極活用したトラブルシューティングTips。Twitter DMのissue対応に即適用 / @jxnlco (OpenAI) / https://x.com/jxnlco/status/2059335932223148488 (Likes 114)
Claude Code / Claude関連アカウント推奨リスト（@bcherny, @trq212らがtips共有） / @katedeyneka / https://x.com/katedeyneka/status/2059329224004256040 (Likes 369)

その他（Windsurf / Gemini Codeなど）

Windsurf / Windsurf CEOの洞察（Moat is a verb）引用 + ツールTier ListでA-Tierに位置づけ / @StartupArchive_ / https://x.com/StartupArchive_/status/2059301030278595016 (Likes 79)

注記:

今日の日付（since:2026-05-26）に限定し、いいね数・信頼性・除外条件を考慮して抽出。
公式リリースやエンジニアの実践Tipsを中心にヒット。憶測・求人・低信頼投稿は除外。
他のツール（GitHub Copilotなど）は今日の該当高品質投稿が少なかった。

B
以下は、Xのリアルタイム検索で確認できた条件をすべて満たす個人開発の成功事例です。
（信頼性フィルター：App Store/Google Playの収益・DLスクリーンショットあり、具体的な数字明記、同一アプリ/開発者で複数投稿あり、既にリリース済みのみ採用。求人・憶測・1投稿のみ・曖昧なものは除外）

勇者60秒RPG / ゲーム（テキストRPG） / 約2ヶ月で売上85,000円（App Store 69,000円 + Stripe 22,000円 + AdMob 4,000円）、直近1日でApp Store売上10,000円 / 開発者 @punimaru_dev / https://apps.apple.com/app/勇者60秒RPG/id6761117151 (スクリーンショット複数投稿あり)
旅行思い出マップ / ユーティリティ（旅行記録・地図アプリ） / 2026年4月収益405,198円（App Store 285,604円 + Admob 117,078円 + Google Play 2,516円）、3月は1,032,284円、12万DL突破 / 開発者 @tsuzuki817 / https://apps.apple.com/jp/app/旅行思い出マップ/id6478291625 （iOS）および Google Play版あり (月次収益公開を複数回投稿、スクリーンショットあり)

### 📄 ファイル1: `public/data/claude/[date].json`

AI 開発ツール全般（Claude・Codex・Cursor・GitHub Copilot・Gemini Code・Windsurf など）の開発者向け情報。スキーマ:

```typescript
{
  date: string                    // "YYYY-MM-DD"
  tools: string[]                 // 今日カバーしたツール例: ["Claude", "Cursor"]
  updates: {
    tool: string                  // "Claude" | "Cursor" | "Codex" | "Copilot" | "Gemini" | "Windsurf" | etc.
    title: string                 // 実際にあった機能・発表のみ。不確かなら tips に移す
    body: string                  // 本文（改行は \n）
    importance: "high" | "medium" | "low"
    code?: { lang: string; code: string }
  }[]
  tips: {
    title: string
    description: string
    code?: { lang: string; code: string }
  }[]
  workflow: {
    title: string
    steps: {
      label: string
      code?: string
    }[]
  }
  modelGuide: {
    model: string                 // "Claude Opus 4.7" など
    useCase: string
    cost: "high" | "medium" | "low"
    when: string
  }[]
}
```

**ルール:**
- **`updates: []` は valid**。情報がない日に無理に出さない
- 架空の情報・不確かなアップデートは書かない。不確かなら `updates` ではなく `tips` に入れる
- Grok リサーチ結果がある場合はそれを優先して使う
- コードは `code.code` フィールドに入れる（JSON 内で文字列エスケープすること）

**`importance` の基準:**
- `"high"` — 週に1〜2件厳守。以下のいずれかに該当する場合のみ:
  - 新モデルのリリース・発表（Claude / GPT / Gemini などの新バージョン）
  - AI 開発ツールのメジャー機能追加（正式リリース済みのもの）
  - API の破壊的変更・大幅な価格改定
  - 重要な公式発表
- `"medium"` — 注目すべき機能追加・改善
- `"low"` — 軽微な変更・マイナーアップデート

---

### 📄 ファイル2: `public/data/ideas/[date].json`

マネタイズ可能な個人開発アイデアを毎日3〜5件。スキーマ:

```typescript
{
  date: string
  theme: string                   // 今日の切り口（一言）
  perspective: string             // 今日の視点（1〜2文）
  ideas: {
    name: string                  // "MeetSnap"
    emoji: string                 // "🎙️"
    score: number                 // 60〜95
    overview: string              // 1〜2文
    platform: "web" | "mobile" | "extension" | "cli"
    direction:
      | "overseas-to-japan"       // 海外成功 → 日本版なし
      | "japan-to-overseas"       // 日本発 → 海外未展開
      | "cheaper-alternative"     // 高すぎる → 個人向け安価版
    source: string                // 起点となった実例を明記
                                  // 例: "Grok: @username が MRR $3k 報告"
                                  //     "App Store 急上昇（フォーカスタイマー系）"
                                  //     "Claude 学習データ: Toggl の日本語対応の gap"
    market: {
      target: string
      size: string                // 具体的な数字。不明なら "要調査"
      gap: string                 // 競合の具体的な弱点
    }
    revenue: {
      free: string                // 無料プランの制限
      model: string               // "SaaS" | "買い切り" | "従量課金"
      price: string               // "¥980/月" など
    }
    features: string[]
    aiUsage: string               // Claude/AI をどこにどう使うか
    competitors: {
      name: string
      threat: "high" | "medium" | "low"
      weakness: string            // 具体的に（「日本語が弱い」ではなく何が弱いか）
    }[]
    conclusion: string            // ✅ 一言評価。法的・規制リスクがあれば ⚠️ で明記
    tags: string[]                // ["会議", "文字起こし", "Whisper"]
  }[]
}
```

**❌ 禁止アイデアカテゴリ（絶対に出さない）:**

以下は「AI アイデアを出して」と言えば誰でも思いつく陳腐なカテゴリ。たとえニッチを絞っても禁止:

- 議事録・会議文字起こし（Notta / Otter 系）
- 社内 FAQ チャットボット・ナレッジ検索
- B2B 営業支援・リード管理
- 採用・面接支援
- 汎用コードレビュー・PR 生成
- 汎用翻訳ツール・要約ツール（読書要約・記事要約など）
- 汎用スケジュール管理・タスク管理（"AI が自動で最適化" 系）
- 汎用チャット UI でデータを質問できる系（"あなたのデータに聞く"）
- 大手が数ヶ月以内に取り込むことが明白な機能（例: ChatGPT / Notion が既に発表済み）

**✅ 良いアイデアの条件（すべて満たすこと）:**

1. **実在する成功事例を起点にする** — App Store ランキング / X の MRR 報告 / Grok 検索結果など。「〇〇のようなアプリ」は禁止
2. **「なぜ今まで誰も作っていないか」を説明できる** — 市場が小さすぎる・規制・技術的難易度・文化的特殊性など
3. **個人が3ヶ月以内に MVP を作れる規模** — 複数の外部 API 依存・法的認定が必要・大量データ収集が前提のものは除外
4. **収益の根拠がある** — 類似アプリが実際に課金されているか、明確な支払い意欲がある層が存在する

**具体的な探し方の例（毎日変える）:**
- App Store / Google Play の特定カテゴリ Top 有料アプリを見て「なぜこれが売れているか」を分析
- Setapp のランキングから Mac ユーザーが実際に金を払うカテゴリを探す
- X で `#buildinpublic` または「個人開発」「MRR」を検索して成功事例を起点にする
- Reddit r/SideProject / r/indiegaming / r/AppStore のヒットスレッドを起点にする
- 日本固有の文化・制度・慣習に根ざした問題（他国では問題にならない）を探す

**品質ルール（必須）:**
- スコアは 60〜95 の範囲。根拠のない高得点禁止
- **具体的な数字を入れる**（DAU・価格・レビュー数など。不明なら `"要調査"`）
- **競合の弱点は具体的に**（「〇〇の決済に未対応」「〇〇のサイトをパースできない」レベル）
- **個人または小チームが作れる規模に限定**（大規模B2B SaaS・企業間連携が必要なものは除外）
- **規制・法的リスクがある場合は `conclusion` に ⚠️ で明記する**（例: 弁護士法72条・e-Tax 認定要件など）
- モバイルは React Native、Web は Next.js を前提にする

**多様性ルール（必須）:**
- `direction`: 1日に `cheaper-alternative` を3件以上出さない。`overseas-to-japan` と `japan-to-overseas` を週合計3件以上含める
- `platform: "mobile"` を週1件以上含める
- ターゲット層: エンジニア以外（クリエイター・一般消費者・非ITフリーランス・学生・特定の趣味コミュニティなど）を週3件以上含める
- 前日と同じドメインカテゴリ（devtools・fintech・content など）を連続させない
- **生成前に `registry.md` を確認し、直近14日以内に使ったテーマ・競合起点と被らせない**
