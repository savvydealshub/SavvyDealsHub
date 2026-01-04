import { db } from '@/lib/db'

export type OfferHistoryPoint = {
  capturedAt: Date
  price: number | null
  shippingPrice: number | null
  shippingIncluded: boolean
  total: number | null
}

/**
 * Compute an "all-in" total price from an offer or snapshot-like object.
 * If shippingIncluded is true, total == price.
 * If shippingIncluded is false, total == price + shippingPrice (when present).
 */
export function computeOfferTotal(input: {
  price: number | null
  shippingPrice?: number | null
  shippingIncluded?: boolean | null
}): number | null {
  const price = input.price
  if (price == null || !Number.isFinite(price)) return null

  const shippingIncluded = Boolean(input.shippingIncluded)
  const shipping = input.shippingPrice
  if (shippingIncluded) return price
  if (shipping == null || !Number.isFinite(shipping)) return price
  return price + shipping
}

export async function getOfferHistory(offerId: number, days = 30): Promise<OfferHistoryPoint[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // If the snapshots table is not present yet (no prisma push), just return empty.
  try {
    const rows = await db.offerPriceSnapshot.findMany({
      where: { offerId, capturedAt: { gte: since } },
      orderBy: { capturedAt: 'asc' },
      select: {
        capturedAt: true,
        price: true,
        shippingPrice: true,
        shippingIncluded: true,
      },
    })

    return rows.map((r) => ({
      capturedAt: r.capturedAt,
      price: r.price,
      shippingPrice: r.shippingPrice,
      shippingIncluded: r.shippingIncluded,
      total: computeOfferTotal(r),
    }))
  } catch {
    return []
  }
}

type BiggestDropRow = {
  offerId: number
  title: string
  retailer: string
  drop: number
}

/**
 * Biggest drops site-wide across all offers (based on snapshots in the last N days).
 */
export async function getBiggestDrops(days = 14, limit = 10): Promise<BiggestDropRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const snapshots = await db.offerPriceSnapshot.findMany({
      where: { capturedAt: { gte: since } },
      orderBy: { capturedAt: 'asc' },
      select: {
        offerId: true,
        capturedAt: true,
        price: true,
        shippingPrice: true,
        shippingIncluded: true,
        offer: { select: { title: true, retailer: true } },
      },
      take: 50000,
    })

    const bestByOffer = new Map<number, { title: string; retailer: string; maxSoFar: number | null; bestDrop: number }>()

    for (const s of snapshots) {
      const total = computeOfferTotal(s)
      if (total == null) continue

      const existing = bestByOffer.get(s.offerId) ?? {
        title: s.offer.title,
        retailer: s.offer.retailer,
        maxSoFar: null as number | null,
        bestDrop: 0,
      }

      if (existing.maxSoFar == null || total > existing.maxSoFar) {
        existing.maxSoFar = total
      } else {
        const drop = existing.maxSoFar - total
        if (drop > existing.bestDrop) existing.bestDrop = drop
      }

      bestByOffer.set(s.offerId, existing)
    }

    return Array.from(bestByOffer.entries())
      .map(([offerId, v]) => ({ offerId, title: v.title, retailer: v.retailer, drop: v.bestDrop }))
      .filter((r) => r.drop > 0)
      .sort((a, b) => b.drop - a.drop)
      .slice(0, limit)
  } catch {
    return []
  }
}

/**
 * Biggest drops within a specific category slug.
 * Used on /c/[slug] pages.
 */
export async function getBiggestDropsByCategory(
  category: string,
  days = 7,
  limit = 8
): Promise<BiggestDropRow[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  try {
    const snapshots = await db.offerPriceSnapshot.findMany({
      where: {
        capturedAt: { gte: since },
        offer: { category },
      },
      orderBy: { capturedAt: 'asc' },
      select: {
        offerId: true,
        capturedAt: true,
        price: true,
        shippingPrice: true,
        shippingIncluded: true,
        offer: { select: { title: true, retailer: true } },
      },
      take: 50000,
    })

    const bestByOffer = new Map<number, { title: string; retailer: string; maxSoFar: number | null; bestDrop: number }>()

    for (const s of snapshots) {
      const total = computeOfferTotal(s)
      if (total == null) continue

      const existing = bestByOffer.get(s.offerId) ?? {
        title: s.offer.title,
        retailer: s.offer.retailer,
        maxSoFar: null as number | null,
        bestDrop: 0,
      }

      if (existing.maxSoFar == null || total > existing.maxSoFar) {
        existing.maxSoFar = total
      } else {
        const drop = existing.maxSoFar - total
        if (drop > existing.bestDrop) existing.bestDrop = drop
      }

      bestByOffer.set(s.offerId, existing)
    }

    return Array.from(bestByOffer.entries())
      .map(([offerId, v]) => ({ offerId, title: v.title, retailer: v.retailer, drop: v.bestDrop }))
      .filter((r) => r.drop > 0)
      .sort((a, b) => b.drop - a.drop)
      .slice(0, limit)
  } catch {
    return []
  }
}
