import type { ClaudeDigest } from '@/types/digest'
import { getDateColor } from '@/lib/gradient'

function CalendarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${m}月${d}日`
}

function CodeCube({ color }: { color: string }) {
  return (
    <div className="relative hidden sm:flex h-36 w-36 shrink-0 items-center justify-center">
      <div
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)` }}
        className="h-28 w-28 rounded-2xl flex items-center justify-center shadow-xl"
      >
        <span className="select-none font-mono text-3xl font-black text-white/90">&lt;/&gt;</span>
      </div>
      {/* decorative sparkles */}
      <div style={{ background: '#fbbf24' }} className="absolute right-1 top-3 h-4 w-4 rounded-full shadow-sm" />
      <div style={{ background: `${color}55` }} className="absolute left-1 bottom-8 h-3 w-3 rounded-full" />
      <div style={{ background: '#818cf8' }} className="absolute right-9 bottom-1 h-3 w-3 rounded-full opacity-80" />
    </div>
  )
}

export function DigestHero({
  update,
  date,
}: {
  update: ClaudeDigest['updates'][number]
  date: string
}) {
  const color = getDateColor(date)

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${color}1c 0%, ${color}0a 55%, transparent 100%)`,
        border: `1px solid ${color}25`,
      }}
      className="mb-8 overflow-hidden rounded-2xl px-8 py-8"
    >
      {/* Badge + Date — full card width */}
      <div className="mb-4 flex items-center justify-between">
        <span
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
          className="rounded-full px-3 py-1 text-xs font-semibold"
        >
          {update.tool} アップデート
        </span>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <CalendarIcon />
          <span className="text-xs">{formatDate(date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Left: content */}
        <div className="min-w-0 flex-1">

          {/* Title */}
          <h1
            style={{ color: 'var(--text)' }}
            className="mb-3 text-2xl font-extrabold leading-tight sm:text-3xl"
          >
            {update.title}
          </h1>

          {/* Subtitle */}
          <p
            style={{ color: 'var(--text-muted)' }}
            className="mb-6 text-base leading-relaxed"
          >
            {update.body}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div
              style={{ background: color }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            >
              <span className="text-xs font-bold text-white">D</span>
            </div>
            <span style={{ color: 'var(--text)' }} className="text-sm font-medium">
              DevKnow 編集部
            </span>
          </div>
        </div>

        {/* Right: illustration */}
        <CodeCube color={color} />
      </div>
    </div>
  )
}
