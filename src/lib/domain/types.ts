import type { Money } from './money'

export type Condition = 'New' | 'Used' | 'Refurbished' | 'Unknown'

/** Retailer membership / loyalty schemes that can affect price or delivery. */
export type RetailerMembership = 'AMAZON_PRIME' | 'NECTAR' | 'CLUBCARD'

/** A user's preferences (declared by the user, not verified). */
export type MembershipPrefs = Partial<Record<RetailerMembership, boolean>>

export type UserContext = {
  postcode?: string
  membership?: MembershipPrefs
}

export type RetailerId = string

export type Product = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  categorySlug: string
}

export type Offer = {
  id: string
  productId: string
  retailerId: RetailerId
  retailerName: string
  url: string
  condition: Condition

  /** Base item price (exclusive of delivery). */
  itemPrice?: Money

  /** Delivery price for the user's context (may be an estimate). */
  deliveryPrice?: Money
  deliveryIsEstimate: boolean
  deliveryNotes?: string

  /** True when a retailer membership is needed to access the best delivery/offer. */
  membershipRequired: boolean
  membershipType?: RetailerMembership

  /** Calculated total (item + delivery). */
  totalPrice?: Money
}
