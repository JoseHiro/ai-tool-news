import Link from 'next/link'

export default function StripeSuccessPage() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="w-full max-w-sm text-center">
        <div
          style={{ background: 'var(--hover)' }}
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--accent)' }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ color: 'var(--text)' }} className="mb-2 text-xl font-bold">
          サブスクリプション完了！
        </h1>
        <p style={{ color: 'var(--text-muted)' }} className="mb-8 text-sm leading-relaxed">
          ご登録ありがとうございます。
          <br />
          すべてのコンテンツが閲覧できるようになりました。
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          コンテンツを読む
        </Link>
      </div>
    </div>
  )
}
