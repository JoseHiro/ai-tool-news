import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sessionOptions, type SessionData } from '@/lib/session'

export async function GET(req: Request) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  session.destroy()
  return NextResponse.redirect(new URL('/login', req.url))
}
