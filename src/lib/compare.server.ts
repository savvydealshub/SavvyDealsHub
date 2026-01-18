import 'server-only'

import type { UiProduct } from './products.server'
import { gbp, round2 } from './domain/money'
import type { Condition, Offer, RetailerMembership, UserContext } from './domain/types'
import { inferRetailerFromUrl } from './retailers/catalog'

/**
 * UI row model (stable contract for the table).  
 * Internally we compute with the domain `Offer` model, then map to this.
 */
export type CompareOffer = {
  /** Optional DB offer id (present when data comes from uploaded CSV/API offers). */
  offerId?: number
  sku: string
  title: string
  description?: string
  imageUrl?: string
  url: string
  retailer: string
  /** ISO timestamp (if available) for transparency / trust */
  updatedAt?: string
  /** Sponsored placement (OFF by default; always labelled if enabled). */
  isSponsored?: boolean
  sponsorLabel?: string
  /** Trust / conversion badge (data-driven) e.g. “Popular choice”. */
  popularityTag?: string
  itemPrice: number | null
  postagePrice: number | null
  condition: Condition
  /** Retailer membership needed to access best offer/delivery (Prime/Nectar/Clubcard etc.) */
  membershipRequired: boolean
  membershipType?: RetailerMembership
  membershipLabel?: string
  totalPrice: number | null
  /** True if delivery is an estimate (until retailer APIs/feeds are connected). */
  deliveryIsEstimate: boolean
  deliveryNotes?: string
}

export type CompareMembershipPrefs = {
  amazonPrime?: boolean
  nectar?: boolean
  clubcard?: boolean
}

function toMembershipPrefs(prefs: CompareMembershipPrefs | undefined): Partial<Record<RetailerMembership, boolean>> {
  return {
    AMAZON_PRIME: Boolean(prefs?.amazonPrime),
    NECTAR: Boolean(prefs?.nectar),
    CLUBCARD: Boolean(prefs?.clubcard),
  }
}

/**
 * Build comparable offers from the existing product list (policy-safe).
 *
 * IMPORTANT:
 * - No scraping
 * - Only consumes your own JSON, authorised feeds, or official APIs
 */
export function buildOffersFromProducts(params: {
  products: UiProduct[]
  postcode?: string
  membership?: CompareMembershipPrefs
}): CompareOffer[] {
  const ctx: UserContext = {
    postcode: (params.postcode ?? '').trim().toUpperCase() || undefined,
    membership: toMembershipPrefs(params.membership),
  }

  return params.products.map((p) => {
    const offer = uiProductToDomainOffer(p, ctx)
    return domainOfferToRow(p, offer)
  })
}

function uiProductToDomainOffer(p: UiProduct, ctx: UserContext): Offer {
  const retailer = inferRetailerFromUrl(p.url)
  const itemPrice = Number.isFinite(p.price as any) ? round2(Number(p.price)) : undefined

  const condition: Condition = (p as any)?.condition ?? inferCondition(p.title ?? '')

  // Membership logic:
  // Column means: retailer membership (Prime/Nectar/Clubcard) may be needed to access best advertised price/delivery.
  const membershipType = (p as any)?.membershipType ?? retailer.membershipType
  const membershipRequired = (p as any)?.membershipRequired != null ? Boolean((p as any)?.membershipRequired) : Boolean(membershipType)

  // Delivery:
  let deliveryCost: number | undefined
  let deliveryIsEstimate = true
  let deliveryNotes: string | undefined

  // If feed includes shipping explicitly, prefer that (more accurate than our estimate).
  if (Number.isFinite(p.shippingPrice as any)) {
    deliveryCost = round2(Number(p.shippingPrice))
    deliveryIsEstimate = false
    deliveryNotes = 'Provided by feed'
  } else if (p.shippingIncluded) {
    deliveryCost = 0
    deliveryIsEstimate = false
    deliveryNotes = 'Shipping included'
  } else if (itemPrice != null) {
    const est = retailer.estimateDelivery({ itemPrice, ctx })
    deliveryCost = est.cost
    deliveryIsEstimate = est.isEstimate
    deliveryNotes = est.notes
  }

  const total =
    itemPrice == null || deliveryCost == null ? undefined : round2(itemPrice + deliveryCost)

  const membershipLabel = membershipType ? membershipLabelFor(membershipType) : undefined

  return {
    id: `${p.sku}:${retailer.id}`,
    productId: p.sku,
    retailerId: retailer.id,
    retailerName: retailer.name,
    url: p.url,
    condition,
    itemPrice: itemPrice == null ? undefined : gbp(itemPrice),
    deliveryPrice: deliveryCost == null ? undefined : gbp(deliveryCost),
    deliveryIsEstimate,
    deliveryNotes,
    membershipRequired,
    membershipType: membershipType,
    totalPrice: total == null ? undefined : gbp(total),
  }
}

function domainOfferToRow(p: UiProduct, o: Offer): CompareOffer {
  return {
    offerId: p.offerId,
    sku: p.sku,
    title: p.title,
    description: p.description,
    imageUrl: p.imageUrl,
    url: o.url,
    retailer: o.retailerName,
    updatedAt: p.updatedAt,
    isSponsored: p.isSponsored ? true : undefined,
    sponsorLabel: p.sponsorLabel,
    popularityTag: undefined,
    itemPrice: o.itemPrice?.amount ?? null,
    postagePrice: o.deliveryPrice?.amount ?? null,
    condition: o.condition,
    membershipRequired: o.membershipRequired,
    membershipType: o.membershipType,
    membershipLabel: o.membershipType ? membershipLabelFor(o.membershipType) : undefined,
    totalPrice: o.totalPrice?.amount ?? null,
    deliveryIsEstimate: o.deliveryIsEstimate,
    deliveryNotes: o.deliveryNotes,
  }
}

function inferCondition(title: string): Condition {
  const t = title.toLowerCase()
  if (t.includes('refurb')) return 'Refurbished'
  if (t.includes('used') || t.includes('pre-owned') || t.includes('preowned')) return 'Used'
  if (t.includes('brand new') || t.includes('new')) return 'New'
  return 'Unknown'
}

function membershipLabelFor(m: RetailerMembership): string {
  if (m === 'AMAZON_PRIME') return 'Prime (may affect delivery)'
  if (m === 'NECTAR') return 'Nectar (some offers)'
  if (m === 'CLUBCARD') return 'Clubcard (some offers)'
  return 'Membership'
}
