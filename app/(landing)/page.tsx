export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { DM_Sans } from 'next/font/google'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getDocDates } from '@/lib/docs'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], display: 'swap' })

export default async function LandingPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (session.userId) {
    const dates = await getDocDates()
    if (dates.length > 0) {
      redirect(`/digests/${dates[0]}`)
    } else {
      redirect('/digests/2026-05-18')
    }
  }

  return (
    <div className={`${dmSans.className} min-h-screen bg-white text-gray-900`}>
      {/* ───── Nav ───── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Image
              src="/img/icon.webp"
              alt=""
              width={30}
              height={30}
              className="rounded-lg object-contain"
              priority
              unoptimized
            />
            <span className="text-sm font-medium tracking-wide text-gray-900">DevKnow</span>
          </Link>

          {/* Center links */}
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 transition-colors hover:text-gray-900">特徴</a>
            <a href="#how-it-works" className="text-sm text-gray-600 transition-colors hover:text-gray-900">使い方</a>
            <a href="#pricing" className="text-sm text-gray-600 transition-colors hover:text-gray-900">料金</a>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
            >
              無料で始める →
            </Link>
          </div>
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section
        style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #f0f9ff 100%)' }}
        className="px-6 py-20 md:py-28"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-14 lg:flex-row lg:gap-16">
          {/* Left: Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1.5 text-xs font-semibold text-indigo-600">
              <span>★</span>
              <span>AI・個人開発の最新ニュースを毎日お届け</span>
            </div>

            {/* Headline */}
            <h1 className="mb-5 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-[3.25rem]">
              開発の「今」を、
              <br />
              毎日{' '}
              <span style={{ color: '#6366f1' }}>あなたのもとへ。</span>
            </h1>

            {/* Description */}
            <p className="mb-8 max-w-lg text-base leading-relaxed text-gray-600 lg:mx-0 mx-auto">
              DevKnow は、AI・テック・個人開発に関する最新情報を毎日厳選してお届けするニュースアプリです。
            </p>

            {/* Buttons */}
            <div className="mb-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start justify-center">
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-600 hover:shadow-lg"
              >
                無料で始める →
              </Link>
              <a
                href="#how-it-works"
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                使い方を見る
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-5 lg:justify-start justify-center">
              {['登録不要で試せる', 'いつでも解約OK', 'Webブラウザで利用可能'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="text-indigo-500">✓</span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: App Mockup */}
          <div className="w-full max-w-[640px] shrink-0 lg:w-[640px]">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              {/* Window chrome */}
              <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-400"></span>
                <span className="ml-3 rounded bg-white px-8 py-0.5 text-[10px] text-gray-400 border border-gray-200">
                  devknow.app
                </span>
              </div>

              {/* App body */}
              <div className="flex h-[360px]">
                {/* Sidebar */}
                <div className="w-44 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50 py-3">
                  {/* Logo row */}
                  <div className="mb-3 flex items-center gap-1.5 px-3">
                    <div className="h-5 w-5 rounded bg-indigo-500"></div>
                    <span className="text-[11px] font-semibold text-gray-700">DevKnow</span>
                  </div>
                  {/* Nav items */}
                  <div className="mb-3 space-y-0.5 px-2">
                    {['ダイジェスト', 'アイデア', 'Tips', 'ガイド'].map((item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2 rounded px-2 py-1.5 text-[10px] ${i === 0 ? 'bg-indigo-100 font-medium text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        <span>{['📋', '💡', '⚡', '📚'][i]}</span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-1 text-[9px] font-semibold uppercase tracking-widest text-gray-400">
                    最近の記事
                  </div>
                  {/* Date links */}
                  {['2026-05-18', '2026-05-17', '2026-05-16', '2026-05-15', '2026-05-14'].map((date, i) => (
                    <div
                      key={date}
                      className={`mx-2 mt-0.5 rounded px-2 py-1.5 text-[10px] ${i === 0 ? 'bg-indigo-50 font-medium text-indigo-600' : 'text-gray-500'}`}
                    >
                      {date}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Date header */}
                  <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-indigo-500">
                    DEVKNOW
                  </div>
                  <div className="mb-4 text-sm font-bold text-gray-800">2026年5月18日</div>

                  {/* Claude section */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-semibold text-purple-600">
                        🆕 Claude / Claude Code
                      </span>
                    </div>
                    <div className="mb-1.5 text-[11px] font-semibold text-gray-800 leading-snug">
                      Claude Code アップデート — 2026-05-18
                    </div>
                    <div className="space-y-1.5">
                      {[
                        '今週の主なアップデート',
                        '開発効率を上げる実践Tips',
                        '今日試すべきワークフロー',
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-1.5">
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-indigo-400"></span>
                          <span className="text-[10px] text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ideas section */}
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-green-600">
                      💰 個人開発アイデア
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: 'AIコードレビューBot', score: 88, tag: 'Web' },
                        { name: 'ニッチSaaS分析ツール', score: 82, tag: 'Web' },
                        { name: 'React Native テンプレ', score: 76, tag: 'Mobile' },
                      ].map((idea) => (
                        <div key={idea.name} className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-gray-700">{idea.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[8px] text-gray-500">
                              {idea.tag}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600">{idea.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ToC panel */}
                <div className="hidden w-28 shrink-0 border-l border-gray-100 bg-white py-4 pl-3 pr-2 xl:block">
                  <div className="mb-2 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    目次
                  </div>
                  <div className="space-y-1.5">
                    {[
                      '🆕 アップデート',
                      '⚡ 実践Tips',
                      '🛠 ワークフロー',
                      '💡 モデル比較',
                      '💰 アイデア',
                    ].map((item) => (
                      <div key={item} className="text-[9px] leading-snug text-gray-500">{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-indigo-500">
            FEATURES
          </div>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900">
            DevKnow でできること
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '⚡',
                title: '毎日の厳選ニュース',
                desc: 'AI・テック・個人開発の最新ニュースを毎日厳選してお届けします。',
              },
              {
                icon: '🗂',
                title: 'カテゴリで簡単に検索',
                desc: '興味あるカテゴリを選んで、必要な情報にすぐアクセス。',
              },
              {
                icon: '♡',
                title: '保存してあとで読む',
                desc: '気になる記事をいいかもして、あとでまとめて確認できます。',
              },
              {
                icon: '📚',
                title: '開発ガイド付き',
                desc: 'Claude Code・Next.js・React Native の実践ガイドがすぐ読めます。',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 text-3xl">{feature.icon}</div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How it works ───── */}
      <section id="how-it-works" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-indigo-500">
            HOW IT WORKS
          </div>
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900">
            使い方
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: '無料登録', desc: 'メールアドレスだけで30秒で登録完了。クレジットカード不要。' },
              { step: '02', title: '毎日チェック', desc: '毎朝更新されるダイジェストをブラウザで確認。お気に入りは保存。' },
              { step: '03', title: 'すぐ実践', desc: 'ガイドやTipsを参照しながら、今日の開発にすぐ活かせる。' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                  {item.step}
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Pricing ───── */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-indigo-500">
            PRICING
          </div>
          <h2 className="mb-3 text-center text-3xl font-bold tracking-tight text-gray-900">
            シンプルな料金体系
          </h2>
          <p className="mb-12 text-center text-sm text-gray-500">まずは無料からお試しください。</p>
          <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
            {/* Free plan */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="mb-1 text-sm font-semibold text-gray-500">フリープラン</div>
              <div className="mb-4 text-3xl font-bold text-gray-900">
                ¥0<span className="text-base font-normal text-gray-400">/月</span>
              </div>
              <ul className="mb-6 space-y-2.5">
                {['最新1日分のダイジェスト', '開発ガイド閲覧', 'Tipsアクセス'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-indigo-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                無料で始める
              </Link>
            </div>
            {/* Pro plan */}
            <div className="relative rounded-xl border-2 border-indigo-500 bg-indigo-50 p-8">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-indigo-500 px-3 py-1 text-xs font-bold text-white">
                  おすすめ
                </span>
              </div>
              <div className="mb-1 text-sm font-semibold text-indigo-600">プロプラン</div>
              <div className="mb-4 text-3xl font-bold text-gray-900">
                ¥490<span className="text-base font-normal text-gray-400">/月</span>
              </div>
              <ul className="mb-6 space-y-2.5">
                {[
                  '過去すべてのダイジェスト',
                  '個人開発アイデア分析',
                  '記事のいいかも保存',
                  'フルアーカイブ検索',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-indigo-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-indigo-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
              >
                プロで始める →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}
        className="px-6 py-20 text-center"
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-3 text-3xl font-bold text-white">今すぐ無料で始める</h2>
          <p className="mb-8 text-indigo-100">
            まずは無料でお試しください。クレジットカード不要。
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
          >
            無料で始める →
          </Link>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row md:justify-between">
          {/* Logo + tagline */}
          <div>
            <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
              <Image
                src="/img/icon.webp"
                alt=""
                width={24}
                height={24}
                className="rounded-md object-contain"
                unoptimized
              />
              <span className="text-sm font-medium text-gray-800">DevKnow</span>
            </Link>
            <p className="mt-1 text-xs text-gray-400">AI・個人開発の最新情報を毎日お届け</p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-xs text-gray-500 transition-colors hover:text-gray-900">
              利用規約
            </Link>
            <Link href="/terms#privacy" className="text-xs text-gray-500 transition-colors hover:text-gray-900">
              プライバシーポリシー
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">© 2026 DevKnow</p>
        </div>
      </footer>
    </div>
  )
}
