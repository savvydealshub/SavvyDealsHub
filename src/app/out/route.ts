import { NextResponse } from 'next/server'

import { db } from '@/lib/db'

/**
 * Outbound redirect wrapper used for revenue intelligence.
 *
 * Why:
 * - Track buyer intent (clicks) in a GDPR-safe way (no cookies, no IPs).
 * - Keep affiliate links swappable later without changing UI.
 *
 * Query params:
 * - offerId: required (DB Offer id)
 * - src: optional source page (compare / trending / home / category)
 * - cta: optional call-to-action variant (e.g. best / row)
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const offerIdRaw = url.searchParams.get('offerId')
  const source = url.searchParams.get('src')?.slice(0, 40) || null
  const cta = url.searchParams.get('cta')?.slice(0, 40) || null

  const offerId = Number(offerIdRaw)
  if (!offerIdRaw || !Number.isFinite(offerId) || offerId <= 0) {
    return NextResponse.json({ error: 'Missing or invalid offerId' }, { status: 400 })
  }

  const offer = await db.offer.findUnique({ where: { id: offerId } })
  if (!offer) {
    return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
  }

  // Record a minimal, privacy-safe click event.
  // Intentionally no IP, no cookie, no user agent stored.
  try {
    await db.clickEvent.create({
      data: {
        offerId: offer.id,
        retailer: offer.retailer,
        category: offer.category,
        source: source ?? undefined,
        cta: cta ?? undefined,
      },
    })
  } catch {
    // Never block the user redirect if analytics fails.
  }

  return NextResponse.redirect(offer.url, { status: 302 })
}
