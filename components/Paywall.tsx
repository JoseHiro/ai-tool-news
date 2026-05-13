export function Paywall() {
  return (
    <div
      style={{ border: '1px solid var(--border)', background: 'var(--sidebar-bg)' }}
      className="mx-auto max-w-md rounded-2xl px-8 py-10 text-center"
    >
      <div
        style={{ background: 'var(--hover)' }}
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: 'var(--accent)' }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h2 style={{ color: 'var(--text)' }} className="mb-2 text-lg font-bold">
        サブスクリプションが必要です
      </h2>
      <p style={{ color: 'var(--text-muted)' }} className="mb-6 text-sm leading-relaxed">
        このコンテンツを読むには有料プランへの登録が必要です。
        <br />
        毎日更新される Claude Code・AI ツール情報をすべて閲覧できます。
      </p>

      <button
        disabled
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
      >
        プランを見る（準備中）
      </button>

      <p style={{ color: 'var(--text-muted)' }} className="mt-4 text-xs">
        サブスクリプション機能は近日公開予定です。
      </p>
    </div>
  )
}
