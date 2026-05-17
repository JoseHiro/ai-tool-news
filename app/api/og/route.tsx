import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? ''
  const title = searchParams.get('title') ?? 'AI・開発の最新情報'

  let dateJa = ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-')
    dateJa = `${y}年${parseInt(m)}月${parseInt(d)}日`
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0d0d0d',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '64px 80px',
          justifyContent: 'space-between',
        }}
      >
        {/* Top: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
          <span style={{ color: '#3b82f6', fontSize: 20, fontWeight: 700, letterSpacing: 6 }}>
            DEVKNOW
          </span>
        </div>

        {/* Bottom: content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dateJa && (
            <span style={{ color: '#6b7280', fontSize: 24 }}>{dateJa}</span>
          )}
          <span
            style={{
              color: '#f9fafb',
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.25,
              maxWidth: 900,
            }}
          >
            {title}
          </span>
          <span style={{ color: '#4b5563', fontSize: 20 }}>
            エンジニア向けデイリーダイジェスト
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
