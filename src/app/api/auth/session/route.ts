import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('logout')) {
    const res = NextResponse.json({ ok: true })
    res.headers.set('Set-Cookie', `sdh_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`)
    return res
  }
  const token = jwt.sign({ uid: 'guest' }, process.env.JWT_SECRET || 'dev', { expiresIn: '7d' })
  const res = NextResponse.json({ ok: true })
  res.headers.set('Set-Cookie', `sdh_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`)
  return res
}
