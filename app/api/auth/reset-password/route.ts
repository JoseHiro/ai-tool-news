import { NextRequest } from 'next/server'
import { findUserByEmail } from '@/lib/users'
import { verifyResetToken } from '@/lib/reset-token'
import { hash } from 'bcryptjs'

function getSql() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require('@neondatabase/serverless')
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

export async function POST(req: NextRequest) {
  const { email, token, expires, newPassword } = await req.json()

  if (!email || !token || !expires || !newPassword) {
    return Response.json({ error: '必須項目が不足しています' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return Response.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 })
  }

  const user = await findUserByEmail(email)
  if (!user) return Response.json({ error: '無効なリンクです' }, { status: 400 })

  const valid = verifyResetToken(email, token, Number(expires), user.password_hash)
  if (!valid) return Response.json({ error: 'リンクが無効または期限切れです' }, { status: 400 })

  const newHash = await hash(newPassword, 10)
  const sql = getSql()
  await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}`

  return Response.json({ ok: true })
}
