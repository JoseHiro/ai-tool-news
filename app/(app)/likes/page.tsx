import type { Metadata } from 'next'
import Link from 'next/link'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { getUserById, getSubscribedUntil } from '@/lib/users'
import { getUserLikes, type LikeEntry } from '@/lib/likes'
import { isSubscribed } from '@/lib/access'
import { Paywall } from '@/components/Paywall'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'いいかも一覧',
  description: 'いいかもしたアイデアと Tips の一覧',
}

function formatDate(date: string) {
  const [y, m, d] = date.split('-')
  return `${y}年${parseInt(m)}月${parseInt(d)}日`
}

function groupByDate(likes: LikeEntry[]): Map<string, LikeEntry[]> {
  const map = new Map<string, LikeEntry[]>()
  for (const like of likes) {
    const list = map.get(like.content_date) ?? []
    list.push(like)
    map.set(like.content_date, list)
  }
  return map
}

const TYPE_LABEL: Record<string, string> = {
  idea: 'IDEAS',
  tip: 'TIPS',
}

export default async function LikesPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.userId) redirect('/login')

  const user = await getUserById(session.userId)
  const subscribedUntil = user ? getSubscribedUntil(user) : null
  const canView = session.isAdmin || isSubscribed(subscribedUntil)

  if (!canView) {
    return (
      <div className="px-8 py-10">
        <div className="mx-auto max-w-2xl">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">Collection</p>
          <h1 style={{ color: 'var(--text)' }} className="mb-8 text-2xl font-bold">いいかも一覧</h1>
          <Paywall />
        </div>
      </div>
    )
  }

  const likes = await getUserLikes(session.userId)
  const grouped = groupByDate(likes)
  const dates = [...grouped.keys()].sort().reverse()

  return (
    <div className="px-8 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <p style={{ color: 'var(--accent)' }} className="mb-1 text-xs font-semibold uppercase tracking-widest">
            Collection
          </p>
          <h1 style={{ color: 'var(--text)' }} className="mb-2 text-2xl font-bold">
            いいかも一覧
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            {likes.length === 0 ? 'まだいいかもしたものはありません' : `${likes.length}件`}
          </p>
        </div>

        {likes.length === 0 ? (
          <div
            style={{ border: '1px solid var(--border)' }}
            className="rounded-xl px-6 py-12 text-center"
          >
            <p style={{ color: 'var(--text-muted)' }} className="mb-4 text-sm">
              ダイジェストのアイデアや Tips の ♡ を押すと、ここに保存されます。
            </p>
            <Link
              href="/"
              style={{ color: 'var(--accent)' }}
              className="text-sm hover:underline"
            >
              最新のダイジェストを見る →
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {dates.map(date => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <Link
                    href={`/digests/${date}`}
                    style={{ color: 'var(--text)' }}
                    className="text-sm font-semibold hover:underline"
                  >
                    {formatDate(date)}
                  </Link>
                  <span style={{ color: 'var(--text-muted)' }} className="text-xs">
                    {grouped.get(date)!.length}件
                  </span>
                </div>
                <div className="space-y-2">
                  {grouped.get(date)!.map(like => (
                    <Link
                      key={like.id}
                      href={`/digests/${like.content_date}`}
                      style={{ border: '1px solid var(--border)' }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[var(--hover)]"
                    >
                      <span
                        style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                        className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest"
                      >
                        {TYPE_LABEL[like.content_type] ?? like.content_type}
                      </span>
                      <span style={{ color: 'var(--text)' }} className="flex-1 truncate text-sm">
                        {like.title}
                      </span>
                      <span style={{ color: '#f43f5e' }} className="shrink-0 text-xs">♡</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
