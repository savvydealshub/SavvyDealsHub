import 'server-only'

import { db } from './db'
import type { UiProduct } from './products.server'

type GetOffersArgs = {
  q?: string | null
  categorySlug?: string | null
  limit?: number | null
}

function normalize(s: string) {
  return s.toLowerCase().trim()
}

/**
 * Fetch comparison offers from the database.
 *
 * This is the primary source for the "True Price" engine once you start uploading CSV feeds
 * (or connecting authorised affiliate APIs).
 */
export async function getUiOffersFromDb(args: GetOffersArgs = {}): Promise<UiProduct[]> {
  const q = args.q ? normalize(args.q) : ''
  const category = args.categorySlug ? normalize(args.categorySlug) : ''
  const limit = args.limit && args.limit > 0 ? args.limit : 500

  const where: any = {}
  if (category) where.category = { equals: category, mode: 'insensitive' }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { retailer: { contains: q, mode: 'insensitive' } },
    ]
  }

  const rows = await db.offer.findMany({
    where,
    take: limit,
    orderBy: { updatedAt: 'desc' },
  })

  return rows.map((o) => ({
    offerId: o.id,
    sku: o.sku,
    title: o.title,
    description: o.description ?? undefined,
    price: typeof o.price === 'number' ? o.price : undefined,
    imageUrl: o.imageUrl ?? undefined,
    url: o.url,
    category: o.category,
    shippingPrice: typeof o.shippingPrice === 'number' ? o.shippingPrice : undefined,
    shippingIncluded: Boolean(o.shippingIncluded),
    membershipRequired: Boolean(o.membershipRequired),
    membershipType: (o.membershipType as any) ?? undefined,
    condition: (o.condition as any) ?? undefined,
    isSponsored: Boolean(o.isSponsored),
    sponsorLabel: o.sponsorLabel ?? undefined,
    source: `db:${o.retailer}`,
    updatedAt: o.updatedAt.toISOString(),
  }))
}

export async function getOfferCount(): Promise<number> {
  return db.offer.count()
}
