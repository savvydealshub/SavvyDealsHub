import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// This route exists to:
// 1) log a GDPR-safe click event (no IP / no cookie identifiers)
// 2) redirect the user out to the retailer (Amazon/eBay/etc)
//
// Your UI links to: /out?offerId=123&src=compare&cta=row
// We also support a fallback direct URL: /out?u=https%3A%2F%2Fexample.com

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function safeHttpUrl(u: string | null): string | null {
  if (!u) return null
  try {
    const url = new URL(u)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const offerIdRaw = searchParams.get('offerId')
  const src = searchParams.get('src') || undefined
  const cta = searchParams.get('cta') || undefined

  // Optional direct URL fallback passed from the UI.
  // This makes redirects resilient if the DB is temporarily unavailable.
  const u = safeHttpUrl(searchParams.get('u'))

  // If we have an offerId, prefer DB lookup so we always redirect to the canonical stored URL.
  const offerId = offerIdRaw ? Number(offerIdRaw) : NaN
  if (Number.isFinite(offerId) && offerId > 0) {
    try {
      const offer = await db.offer.findUnique({
        where: { id: offerId },
        select: { id: true, url: true, retailer: true, category: true },
      })

      if (offer?.url) {
        // Fire-and-forget click logging (don’t block redirect if logging fails)
        try {
          await db.clickEvent.create({
            data: {
              offerId: offer.id,
              retailer: offer.retailer,
              category: offer.category,
              source: src,
              cta,
            },
          })
        } catch {
          // ignore
        }

        const dest = safeHttpUrl(offer.url) || u
        if (dest) return NextResponse.redirect(dest, { status: 302 })
      }
    } catch {
      // DB might be unavailable; fall back to u if provided
      if (u) return NextResponse.redirect(u, { status: 302 })
    }
  }

  // Direct URL redirect (no click logging)
  if (u) return NextResponse.redirect(u, { status: 302 })

  // Safe fallback
  return NextResponse.redirect(new URL('/compare?q=Top%20Deals', req.url), { status: 302 })
}
