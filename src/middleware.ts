import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Enterprise SEO guardrails:
 * - Production domain (savvydealshub.com / www) is indexable
 * - Preview / staging / platform domains get noindex via header
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase()

  const isProdHost =
    host === 'savvydealshub.com' ||
    host === 'www.savvydealshub.com' ||
    host.endsWith('.savvydealshub.com')

  const res = NextResponse.next()

  if (!isProdHost) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
