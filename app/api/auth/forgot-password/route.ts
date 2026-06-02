import { NextRequest } from 'next/server'
import { findUserByEmail } from '@/lib/users'
import { generateResetToken } from '@/lib/reset-token'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return Response.json({ error: 'メールアドレスが必要です' }, { status: 400 })

  const user = await findUserByEmail(email.toLowerCase().trim())

  // Always return success to prevent email enumeration
  if (!user) return Response.json({ ok: true })

  const { token, expires } = generateResetToken(user.email, user.password_hash)
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const resetUrl = `${base}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}&expires=${expires}`

  await sendPasswordResetEmail(user.email, resetUrl)

  return Response.json({ ok: true })
}
