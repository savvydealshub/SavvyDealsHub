import { db } from '../db'

export type OfferSnapshotRow = {
  capturedAt: Date
  price: number | null
  shippingPrice: number | null
  shippingIncluded: boolean
  total: number | null
}

export function computeOfferTotal(price: number | null, shippingPrice: number | null, shippingIncluded: boolean): number | null {
  if (price === null || !Number.isFinite(price)) return null
  const ship = shippingIncluded ? 0 : (shippingPrice ?? 0)
  const total = price + (Number.isFinite(ship) ? ship : 0)
  return Math.round(total * 100) / 100
}

export async function recordSnapshotsForOfferIds(offerIds: number[]) {
  if (offerIds.length === 0) return { n: 0 }
  const offers = await db.offer.findMany({
    where: { id: { in: offerIds } },
    select: { id: true, price: true, shippingPrice: true, shippingIncluded: true },
  })
  if (!offers.length) return { n: 0 }

  await db.offerPriceSnapshot.createMany({
    data: offers.map((o) => ({
      offerId: o.id,
      price: o.price,
      shippingPrice: o.shippingPrice,
      shippingIncluded: o.shippingIncluded,
    })),
  })

  return { n: offers.length }
}

export async function recordSnapshotsForAllOffers(batchSize = 1000) {
  let cursor: number | undefined
  let total = 0
  while (true) {
    const offers = await db.offer.findMany({
      take: batchSize,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: 'asc' },
      select: { id: true, price: true, shippingPrice: true, shippingIncluded: true },
    })
    if (offers.length === 0) break
    cursor = offers[offers.length - 1].id

    await db.offerPriceSnapshot.createMany({
      data: offers.map((o) => ({
        offerId: o.id,
        price: o.price,
        shippingPrice: o.shippingPrice,
        shippingIncluded: o.shippingIncluded,
      })),
    })
    total += offers.length
  }
  return { n: total }
}

export async function getOfferHistory(offerId: number, limit = 60): Promise<OfferSnapshotRow[]> {
  const snaps = await db.offerPriceSnapshot.findMany({
    where: { offerId },
    orderBy: { capturedAt: 'desc' },
    take: limit,
    select: { capturedAt: true, price: true, shippingPrice: true, shippingIncluded: true },
  })
  return snaps.map((s) => ({
    ...s,
    total: computeOfferTotal(s.price, s.shippingPrice, s.shippingIncluded),
  }))
}

export async function getBiggestDropsByCategory(category: string, days = 7, take = 10) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  // Find offers in category
  const offers = await db.offer.findMany({
    where: { category },
    select: { id: true, title: true, retailer: true, url: true, imageUrl: true, price: true, shippingPrice: true, shippingIncluded: true },
    take: 2000,
  })
  if (!offers.length) return []

  // Load recent snapshots for these offers
  const ids = offers.map((o) => o.id)
  const snaps = await db.offerPriceSnapshot.findMany({
    where: { offerId: { in: ids }, capturedAt: { gte: since } },
    orderBy: { capturedAt: 'asc' },
    select: { offerId: true, capturedAt: true, price: true, shippingPrice: true, shippingIncluded: true },
  })

  const byOffer = new Map<number, OfferSnapshotRow[]>()
  for (const s of snaps) {
    const row: OfferSnapshotRow = { ...s, total: computeOfferTotal(s.price, s.shippingPrice, s.shippingIncluded) }
    const arr = byOffer.get(s.offerId) ?? []
    arr.push(row)
    byOffer.set(s.offerId, arr)
  }

  const results: any[] = []
  for (const o of offers) {
    const hist = byOffer.get(o.id)
    if (!hist || hist.length < 2) continue
    const first = hist[0].total
    const last = hist[hist.length - 1].total
    if (first === null || last === null) continue
    const drop = Math.round((first - last) * 100) / 100
    if (drop <= 0) continue
    results.push({
      offerId: o.id,
      title: o.title,
      retailer: o.retailer,
      url: o.url,
      imageUrl: o.imageUrl,
      currentTotal: computeOfferTotal(o.price, o.shippingPrice, o.shippingIncluded),
      drop,
    })
  }

  results.sort((a, b) => b.drop - a.drop)
  return results.slice(0, take)
}
