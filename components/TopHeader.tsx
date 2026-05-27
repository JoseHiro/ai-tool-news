import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { UserMenu } from '@/components/UserMenu'

export async function TopHeader() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  const isAuthed = !!session.userId

  const menu = (
    <UserMenu isAuthed={isAuthed} />
  )

  return (
    <>
      {/* Mobile — fixed top-right (mirrors hamburger on the left) */}
      <div className="fixed right-3 top-3 z-40 md:hidden">
        {menu}
      </div>

      {/* Desktop — header bar */}
      <div
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
        className="hidden shrink-0 items-center justify-between px-8 py-3 md:flex"
      >
        <p style={{ color: 'var(--text-muted)' }} className="text-sm italic">
          最新情報を、もっと分かりやすく。
        </p>
        {menu}
      </div>
    </>
  )
}
