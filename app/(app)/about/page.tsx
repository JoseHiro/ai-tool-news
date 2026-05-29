import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'DevKnow とは？',
  description: 'AIと開発を、もっと身近にするニュース＆アイデアメディア。毎日の厳選ダイジェスト・個人開発アイデア・実践ガイドをお届けします。',
}

const features = [
  {
    emoji: '⚡',
    title: '毎日の AI ツールニュース',
    desc: 'Claude・Cursor・Codex・GitHub Copilot など主要 AI ツールの最新アップデートを毎日厳選。使えるTipsとワークフローもセットで届きます。',
  },
  {
    emoji: '💡',
    title: 'マネタイズ可能な個人開発アイデア',
    desc: '毎日3〜5件、実在する成功事例をもとにしたアイデアを分析してお届け。市場規模・競合の弱点・収益モデルまで掘り下げます。',
  },
  {
    emoji: '📚',
    title: '実践ガイド',
    desc: 'Claude Code・Next.js・React Native のベストプラクティスをまとめた開発ガイドをいつでも参照できます。',
  },
  {
    emoji: '♡',
    title: 'いいかも保存',
    desc: '気になったアップデートやアイデアを「いいかも」してあとでまとめて確認。週間の人気記事もチェックできます。',
  },
]

const sections = [
  {
    heading: '🆕 AI ツール最新アップデート',
    items: [
      '主要 AI ツールの新機能・リリース情報',
      'エンジニアが実際に使っている実践 Tips',
      'コピーして使えるワークフロー',
    ],
  },
  {
    heading: '💰 個人開発アイデア',
    items: [
      'スコア付きアイデア（60〜95点）',
      '市場規模・ターゲット・競合分析',
      '収益モデルと MVP 完成までの目安週数',
    ],
  },
  {
    heading: '⚡ Tips & ガイド',
    items: [
      'Claude Code のおすすめワークフロー',
      'Next.js / React Native の実装ガイド',
      'モデル使い分けガイド（Opus / Sonnet / Haiku）',
    ],
  },
]

const plans = [
  {
    name: 'フリープラン',
    price: '¥0',
    period: '/月',
    items: ['最新1日分のダイジェスト', '開発ガイド閲覧', 'Tips アクセス'],
    cta: '無料で始める',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'プロプラン',
    price: '¥490',
    period: '/月',
    items: ['過去すべてのダイジェスト', '個人開発アイデア分析', '記事のいいかも保存', 'フルアーカイブ'],
    cta: 'プロで始める →',
    href: '/signup',
    highlight: true,
  },
]

export default function AboutPage() {
  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-3xl space-y-14">

        {/* Header */}
        <div>
          <p style={{ color: 'var(--accent)' }} className="mb-2 text-xs font-semibold uppercase tracking-widest">
            About
          </p>
          <h1 style={{ color: 'var(--text)' }} className="mb-4 text-2xl font-bold">
            DevKnow とは？
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-base leading-relaxed">
            AI と開発を、もっと身近にするニュース＆アイデアメディアです。<br />
            毎日、AI ツールの最新情報と個人開発アイデアを厳選してお届けします。
          </p>
        </div>

        {/* Features */}
        <div>
          <h2 style={{ color: 'var(--text)' }} className="mb-5 text-sm font-semibold uppercase tracking-widest">
            できること
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {features.map(f => (
              <div
                key={f.title}
                style={{ border: '1px solid var(--border)' }}
                className="rounded-xl p-5"
              >
                <span className="mb-3 block text-2xl">{f.emoji}</span>
                <h3 style={{ color: 'var(--text)' }} className="mb-1.5 text-sm font-semibold">{f.title}</h3>
                <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's in a digest */}
        <div>
          <h2 style={{ color: 'var(--text)' }} className="mb-5 text-sm font-semibold uppercase tracking-widest">
            毎日のダイジェストに含まれるもの
          </h2>
          <div className="space-y-3">
            {sections.map(s => (
              <div
                key={s.heading}
                style={{ border: '1px solid var(--border)' }}
                className="overflow-hidden rounded-xl"
              >
                <div
                  style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}
                  className="px-4 py-2.5"
                >
                  <p style={{ color: 'var(--text)' }} className="text-sm font-semibold">{s.heading}</p>
                </div>
                <ul className="divide-y px-4 py-1" style={{ borderColor: 'var(--border)' }}>
                  {s.items.map(item => (
                    <li key={item} className="flex items-center gap-2 py-2">
                      <svg style={{ color: 'var(--accent)', opacity: 0.75 }} className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 style={{ color: 'var(--text)' }} className="mb-5 text-sm font-semibold uppercase tracking-widest">
            使い方
          </h2>
          <div className="flex flex-col gap-0">
            {[
              { step: '01', title: '無料登録', desc: 'メールアドレスだけで30秒で登録。クレジットカード不要。' },
              { step: '02', title: '毎日チェック', desc: '毎朝更新されるダイジェストをブラウザで確認。気になった記事はいいかも保存。' },
              { step: '03', title: 'すぐ実践', desc: 'ガイドや Tips を参照しながら、今日の開発にすぐ活かせます。' },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    style={{ background: 'var(--accent)', color: '#fff' }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  >
                    {item.step}
                  </div>
                  {i < 2 && (
                    <div style={{ background: 'var(--border)' }} className="my-1 w-px flex-1" />
                  )}
                </div>
                <div className="min-w-0 pb-6">
                  <p style={{ color: 'var(--text)' }} className="mb-1 text-sm font-semibold">{item.title}</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <h2 style={{ color: 'var(--text)' }} className="mb-5 text-sm font-semibold uppercase tracking-widest">
            料金
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plans.map(plan => (
              <div
                key={plan.name}
                style={{
                  border: plan.highlight ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: plan.highlight ? `color-mix(in srgb, var(--accent) 6%, var(--bg))` : 'var(--bg)',
                }}
                className="relative rounded-xl p-6"
              >
                {plan.highlight && (
                  <span
                    style={{ background: 'var(--accent)', color: '#fff' }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-bold"
                  >
                    おすすめ
                  </span>
                )}
                <p style={{ color: plan.highlight ? 'var(--accent)' : 'var(--text-muted)' }} className="mb-1 text-xs font-semibold">
                  {plan.name}
                </p>
                <p style={{ color: 'var(--text)' }} className="mb-4 text-2xl font-bold">
                  {plan.price}<span style={{ color: 'var(--text-muted)' }} className="text-sm font-normal">{plan.period}</span>
                </p>
                <ul className="mb-5 space-y-1.5">
                  {plan.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--accent)' }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  style={plan.highlight
                    ? { background: 'var(--accent)', color: '#fff' }
                    : { border: '1px solid var(--border)', color: 'var(--text)' }
                  }
                  className="block rounded-lg py-2.5 text-center text-xs font-semibold transition-opacity hover:opacity-80"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <div style={{ borderTop: '1px solid var(--border)' }} className="flex items-center justify-between pt-6">
          <Link
            href="/terms"
            style={{ color: 'var(--text-muted)' }}
            className="text-xs transition-colors hover:text-[var(--text)]"
          >
            免責事項
          </Link>
          <Link
            href="/"
            style={{ color: 'var(--text-muted)' }}
            className="text-xs transition-colors hover:text-[var(--text)]"
          >
            ← トップへ
          </Link>
        </div>

      </div>
    </div>
  )
}
