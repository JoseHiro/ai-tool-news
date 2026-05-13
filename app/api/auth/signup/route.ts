import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { hash } from 'bcryptjs'
import { validateSignupInput } from '@/lib/auth'
import { createUser, findUserByEmail } from '@/lib/users'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function POST(req: Request) {
  try {
    const { email, password, confirm } = await req.json()

    const validationError = validateSignupInput(email ?? '', password ?? '', confirm ?? '')
    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 })
    }

    const existing = await findUserByEmail(email.trim())
    if (existing) {
      return Response.json({ error: 'このメールアドレスはすでに登録されています' }, { status: 409 })
    }

    const passwordHash = await hash(password, 10)
    await createUser(email.trim().toLowerCase(), passwordHash)

    const user = await findUserByEmail(email.trim().toLowerCase())
    if (!user) {
      return Response.json({ error: 'アカウント作成に失敗しました' }, { status: 500 })
    }

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    session.userId = user.id as number
    session.email = user.email as string
    await session.save()

    return Response.json({ ok: true, email: user.email })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'サーバーエラー' }, { status: 500 })
  }
}
