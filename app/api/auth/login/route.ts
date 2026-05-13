import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, type SessionData } from '@/lib/session'
import { findUserByEmail, seedAdminIfNeeded } from '@/lib/users'
import { isAdmin } from '@/lib/access'
import { compare } from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    await seedAdminIfNeeded()
    const user = await findUserByEmail(email)

    if (!user || !(await compare(password, user.password_hash as string))) {
      return Response.json({ error: 'メールアドレスまたはパスワードが違います' }, { status: 401 })
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    session.userId = user.id as number
    session.email = user.email as string
    session.isAdmin = isAdmin(user.email as string)
    await session.save()

    return Response.json({ ok: true, email: user.email })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
