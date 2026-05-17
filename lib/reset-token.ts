import { createHmac, timingSafeEqual } from 'crypto'

const EXPIRES_MS = 60 * 60 * 1000 // 1 hour

function secret(passwordHash: string) {
  return (process.env.SESSION_PASSWORD ?? '') + passwordHash
}

export function generateResetToken(email: string, passwordHash: string) {
  const expires = Date.now() + EXPIRES_MS
  const payload = `${email}:${expires}`
  const token = createHmac('sha256', secret(passwordHash)).update(payload).digest('hex')
  return { token, expires }
}

export function verifyResetToken(
  email: string,
  token: string,
  expires: number,
  passwordHash: string,
): boolean {
  if (Date.now() > expires) return false
  const payload = `${email}:${expires}`
  const expected = createHmac('sha256', secret(passwordHash)).update(payload).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}
