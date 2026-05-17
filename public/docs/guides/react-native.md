---
title: React Native × Claude Code ガイド
description: Expo + React Native を使ったモバイルアプリ開発のベストプラクティス。Claude との相性が良い構成と、iOS / Android 両対応で詰まりやすいポイントをまとめました。
emoji: 📱
category: react-native
updatedAt: 2026-05-18
---

## Expo vs Bare Workflow

React Native には「Expo Managed」「Expo Bare」「Bare React Native」の3つの選択肢があります。個人開発では **Expo Managed（Expo Go + EAS Build）** を強く推奨します。

| | Expo Managed | Expo Bare | Bare RN |
|--|------------|-----------|---------|
| セットアップ | `npx create-expo-app` | `npx create-expo-app --template bare` | `npx react-native init` |
| ネイティブコード | 触らなくていい | 必要に応じて | 常に必要 |
| Claude との相性 | ◎ TypeScript + JSX のみ | ○ | △ Xcode/Gradle 知識が必要 |
| OTA アップデート | ✅ Expo Updates | ✅ | ❌ |
| カスタムネイティブ | ❌ | ✅ | ✅ |

**迷ったら Expo Managed**。ネイティブ SDK（Bluetooth、カスタムカメラ等）が必要になったときだけ Bare に移行します。

---

## 推奨スタック

| レイヤー | 選択肢 | 理由 |
|----------|--------|------|
| 基盤 | Expo SDK 52+ | LTS、EAS Build 対応 |
| ルーティング | Expo Router v4 | ファイルベース、Web と共通化可能 |
| スタイリング | NativeWind v4 | Tailwind CSS と同じ記法 |
| 状態管理 | Zustand | シンプル、ボイラープレートなし |
| データ取得 | TanStack Query v5 | キャッシュ・再フェッチ・楽観更新 |
| フォーム | React Hook Form | バリデーション込みで軽量 |
| API 通信 | `fetch` / `axios` | Expo 標準の fetch で十分 |
| バックエンド | Next.js API Routes / Supabase | Web アプリと共有できる |

---

## ディレクトリ構成（Expo Router）

```
my-app/
├── app/                    # 画面（ファイルがそのままルート）
│   ├── _layout.tsx         # ルートレイアウト
│   ├── index.tsx           # ホーム画面 (/)
│   ├── (tabs)/             # タブナビゲーション
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   └── profile.tsx
│   └── (auth)/
│       ├── login.tsx
│       └── signup.tsx
├── components/             # 再利用コンポーネント
├── hooks/                  # カスタムフック
├── lib/                    # API クライアント・ユーティリティ
│   └── api.ts
├── store/                  # Zustand ストア
├── assets/                 # 画像・フォント
├── CLAUDE.md
└── app.json                # Expo 設定
```

---

## CLAUDE.md テンプレート

```markdown
# アプリ名

## スタック
- Expo SDK 52 (Managed Workflow)
- Expo Router v4（ファイルベースルーティング）
- TypeScript
- NativeWind v4（Tailwind CSS 記法）
- Zustand（状態管理）
- TanStack Query v5（データ取得）

## ルール
- StyleSheet.create は使わない。NativeWind のクラスを使う
- Platform.select で iOS/Android の分岐を書く場合は必ずコメントを添える
- ネイティブモジュールが必要な場合は先に相談する
- 画面コンポーネントは app/ に置き、ロジックは hooks/ か lib/ に分離する

## やらないこと
- Expo Go で動かない機能は MVP に含めない
- In-App Purchase は対象外（外部リンクで代替）
- iPad 対応は対象外
```

---

## Claude との開発フロー

### ステップ 1: ナビゲーション構造を決める

Expo Router ではファイル構成 = ルート構成なので、最初に画面一覧を整理します。

```
「以下の画面構成で app/ ディレクトリを作ってください。
 Expo Router v4 を使います。

 画面:
 - / (index): ホーム（ログイン済みの場合のみ表示）
 - /login: ログイン
 - /signup: サインアップ
 - /(tabs)/home: タブ1 - フィード
 - /(tabs)/profile: タブ2 - プロフィール
 
 未ログインの場合は /login にリダイレクトします」
```

### ステップ 2: コンポーネントを作る

```
「NativeWind v4 を使って、以下の仕様で Button コンポーネントを作ってください。

 Props:
 - label: string
 - onPress: () => void
 - variant: 'primary' | 'secondary' | 'ghost'
 - loading?: boolean
 - disabled?: boolean
 
 プライマリは青背景白テキスト、セカンダリはボーダーのみ、
 ゴーストはテキストのみのスタイルです」
```

### ステップ 3: API 連携を作る

```
「TanStack Query v5 と fetch を使って、
 /api/posts から投稿一覧を取得する usePostsQuery フックを作ってください。
 
 エラー時はトースト通知を表示します。
 ローカルの lib/api.ts にベース URL の設定があります」
```

---

## プラットフォーム別の注意点

### iOS

**Safe Area に対応する**

iPhone のノッチ・Dynamic Island 周辺は SafeAreaView または `useSafeAreaInsets` で余白を確保します。

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function Screen() {
  const insets = useSafeAreaInsets()
  return (
    <View style={{ paddingTop: insets.top }}>
      {/* ... */}
    </View>
  )
}
```

**キーボードでコンテンツが隠れる問題**

フォームを含む画面には `KeyboardAvoidingView` を使います。

```typescript
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <TextInput ... />
</KeyboardAvoidingView>
```

### Android

**バックボタンの対応**

Android の物理バックボタンは `useNavigation().goBack()` で対応できますが、モーダルや特殊な画面では `BackHandler` で明示的に制御します。

**Status Bar の色**

Android では Status Bar のテキスト色を `expo-status-bar` で制御します。

```typescript
import { StatusBar } from 'expo-status-bar'

// 明るい背景のとき
<StatusBar style="dark" />
// 暗い背景のとき
<StatusBar style="light" />
```

---

## よくある落とし穴

**`flex: 1` を忘れる**

React Native のレイアウトは Web と違い、デフォルトで `flexDirection: 'column'` ですが、子要素は `flex: 1` を明示しないと高さが出ません。

```typescript
// ❌ 画面が表示されない
<View>
  <ScrollView>...</ScrollView>
</View>

// ✅
<View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }}>...</ScrollView>
</View>
```

**`ScrollView` の中に `FlatList` を入れない**

ScrollView の中に FlatList を入れると仮想化が無効になりパフォーマンスが落ちます。リストは FlatList の `ListHeaderComponent` で代替します。

**`useEffect` の依存配列に注意**

React Native では Web より頻繁にコンポーネントのアンマウント/マウントが起きます。副作用のクリーンアップを忘れると、バックグラウンドでリクエストが走り続けます。

**画像は `expo-image` を使う**

React Native 標準の `<Image>` よりも `expo-image` の方がキャッシュ・パフォーマンスが優れています。Claude に頼む際はあらかじめ指定します。

```
「画像表示には expo-image の <Image> コンポーネントを使ってください。
 React Native 標準の Image は使わないでください」
```

**EAS Build は時間がかかる**

Expo Go では動くが EAS Build（実機ビルド）で失敗するケースがあります。ネイティブ依存のあるパッケージを追加したら早めに EAS Build で確認します。

```bash
# 開発ビルドの作成
eas build --platform ios --profile development

# OTA アップデート（JS のみの変更）
eas update --branch preview
```
