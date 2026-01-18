import type { UiProduct } from '../products.server'

export type ShippingSanity = {
  itemPrice: number | null
  shippingPrice: number | null
  shippingIncluded: boolean
  shippingKnown: boolean
  shippingUnknown: boolean
  totalPrice: number | null
  highDelivery: boolean
  highDeliveryReason?: string
  eligibleForDeals: boolean
}

function isBulkyHomewareCategory(category?: string | null): boolean {
  const c = String(category ?? '').toLowerCase()
  if (!c) return false
  // Keep this conservative; we only loosen thresholds for clearly bulky homeware.
  return (
    c.includes('furniture') ||
    c.includes('sofa') ||
    c.includes('couch') ||
    c.includes('bed') ||
    c.includes('mattress') ||
    c.includes('wardrobe') ||
    c.includes('dining') ||
    c.includes('table') ||
    c.includes('chair')
  )
}

/**
 * Default shipping caps for "deal" surfaces (Top Deals + Homeware).
 * We still allow higher delivery on bulky furniture-like items, but we never allow extortionate postage.
 */
export function getDealShippingCap(category?: string | null): number {
  return isBulkyHomewareCategory(category) ? 9.99 : 4.99
}

function toNumberOrNull(v: any): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^0-9.\-]/g, '').trim())
  return Number.isFinite(n) ? n : null
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Shipping sanity rules.
 *
 * Goal: prevent "£9.99 item + £16.99 delivery" from ever appearing as a "deal".
 *
 * We don't scrape delivery from retailer checkouts.
 * We only trust shipping fields in authorised feeds (CSV/API).
 */
export function computeShippingSanity(input: {
  price?: number | null
  shippingPrice?: number | null
  shippingIncluded?: boolean | null
  category?: string | null
}): ShippingSanity {
  const item = toNumberOrNull(input.price)
  const itemPrice = item != null && item > 0 ? round2(item) : null

  const shippingIncluded = Boolean(input.shippingIncluded)

  let shippingPrice: number | null = null
  let shippingKnown = false

  if (shippingIncluded) {
    shippingPrice = 0
    shippingKnown = true
  } else {
    const s = toNumberOrNull(input.shippingPrice)
    if (s != null && s >= 0) {
      shippingPrice = round2(s)
      shippingKnown = true
    }
  }

  const shippingUnknown = !shippingKnown
  const totalPrice = itemPrice != null && shippingKnown && shippingPrice != null ? round2(itemPrice + shippingPrice) : null

  // High delivery heuristics:
  // - extreme: delivery >= item price
  // - absolute: above a category-aware ceiling is considered unusually high
  // - relative: delivery > 35% of item price AND delivery > the default deal cap
  let highDelivery = false
  let highDeliveryReason: string | undefined

  if (itemPrice != null && shippingKnown && shippingPrice != null) {
    if (shippingPrice >= itemPrice) {
      highDelivery = true
      highDeliveryReason = 'Delivery >= item price'
    } else if (shippingPrice > (isBulkyHomewareCategory(input.category) ? 14.99 : 9.99)) {
      highDelivery = true
      highDeliveryReason = 'Delivery unusually high'
    } else if (shippingPrice > getDealShippingCap(input.category) && shippingPrice / itemPrice > 0.35) {
      highDelivery = true
      highDeliveryReason = 'Delivery high vs item price'
    }
  }

  const eligibleForDeals = itemPrice != null && shippingKnown && !highDelivery && totalPrice != null

  return {
    itemPrice,
    shippingPrice,
    shippingIncluded,
    shippingKnown,
    shippingUnknown,
    totalPrice,
    highDelivery,
    highDeliveryReason,
    eligibleForDeals,
  }
}

export type DealPartition = {
  eligible: UiProduct[]
  highDelivery: UiProduct[]
  unknownDelivery: UiProduct[]
}

/**
 * Partition a list into:
 * - eligible (shipping known + sane)
 * - high delivery (shipping known but too expensive)
 * - unknown delivery (shipping not supplied by feed)
 */
export function partitionByDelivery(items: UiProduct[]): DealPartition {
  const eligible: UiProduct[] = []
  const highDelivery: UiProduct[] = []
  const unknownDelivery: UiProduct[] = []

  for (const p of items) {
    const s = computeShippingSanity({
      price: p.price ?? null,
      shippingPrice: p.shippingPrice ?? null,
      shippingIncluded: p.shippingIncluded ?? null,
      category: (p as any).category ?? null,
    })

    // Hub pages / category links (no price) should never be classed as a "bad deal".
    if (s.itemPrice == null) {
      eligible.push(p)
      continue
    }

    if (s.shippingUnknown) unknownDelivery.push(p)
    else if (s.highDelivery) highDelivery.push(p)
    else eligible.push(p)
  }

  return { eligible, highDelivery, unknownDelivery }
}
