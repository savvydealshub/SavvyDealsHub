import { round2 } from '../domain/money'
import type { MembershipPrefs, RetailerMembership, RetailerId, UserContext } from '../domain/types'

export type Retailer = {
  id: RetailerId
  name: string
  /** Membership that may be required to access best delivery/deals. */
  membershipType?: RetailerMembership
  /** Conservative delivery estimator until proper APIs/feeds are connected. */
  estimateDelivery: (args: {
    itemPrice: number
    ctx: UserContext
  }) => { cost: number; isEstimate: true; notes?: string }
}

export function inferRetailerFromUrl(url: string): Retailer {
  let host = ''
  try {
    const u = new URL(url)
    host = u.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    host = ''
  }

  if (host.includes('amazon.')) return retailers.amazon
  if (host.includes('ebay.')) return retailers.ebay
  if (host.includes('argos.')) return retailers.argos
  if (host.includes('currys.')) return retailers.currys
  if (host.includes('ao.')) return retailers.ao
  if (host.includes('johnlewis.')) return retailers.johnLewis
  if (host.includes('tesco.')) return retailers.tesco
  if (host.includes('sainsburys.')) return retailers.sainsburys

  // fallback: use host base name for display
  const base = (host.split('.')[0] ?? '').trim()
  const name = base ? base.slice(0, 1).toUpperCase() + base.slice(1) : 'Retailer'
  return {
    id: base || 'retailer',
    name,
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true }),
  }
}

export function hasMembership(prefs: MembershipPrefs | undefined, membership: RetailerMembership | undefined): boolean {
  if (!membership) return false
  return Boolean(prefs?.[membership])
}

function defaultDelivery(itemPrice: number, ctx: UserContext): number {
  // Default baseline (conservative)
  let cost = itemPrice >= 50 ? 0 : 4.99
  cost = applyRemoteAreaSurcharge(cost, ctx.postcode)
  return round2(cost)
}

function applyRemoteAreaSurcharge(cost: number, postcode?: string): number {
  if (cost <= 0) return cost
  const pc = (postcode ?? '').trim().toUpperCase()
  if (!pc) return cost
  const prefix = (pc.split(' ')[0] ?? '').toUpperCase()
  const remotePrefixes = ['BT', 'HS', 'IV', 'KW', 'ZE', 'IM', 'GY', 'JE']
  if (remotePrefixes.some((p) => prefix.startsWith(p))) return round2(cost + 9.99)
  return cost
}

const retailers: Record<string, Retailer> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    membershipType: 'AMAZON_PRIME',
    estimateDelivery: ({ itemPrice, ctx }) => {
      const isPrime = hasMembership(ctx.membership, 'AMAZON_PRIME')
      let cost = 0
      let notes = 'Prime delivery assumed' 
      if (!isPrime) {
        cost = itemPrice >= 35 ? 0 : 4.99
        notes = itemPrice >= 35 ? 'Free standard delivery over £35 (estimate)' : 'Standard delivery (estimate)'
      }
      cost = applyRemoteAreaSurcharge(cost, ctx.postcode)
      return { cost: round2(cost), isEstimate: true, notes }
    },
  },
  ebay: {
    id: 'ebay',
    name: 'eBay',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: applyRemoteAreaSurcharge(3.99, ctx.postcode), isEstimate: true, notes: 'Typical eBay delivery (estimate)' }),
  },
  argos: {
    id: 'argos',
    name: 'Argos',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: applyRemoteAreaSurcharge(3.95, ctx.postcode), isEstimate: true, notes: 'Standard delivery (estimate)' }),
  },
  currys: {
    id: 'currys',
    name: 'Currys',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true, notes: 'Delivery estimate until retailer feed is connected' }),
  },
  ao: {
    id: 'ao',
    name: 'AO',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true, notes: 'Delivery estimate until retailer feed is connected' }),
  },
  johnLewis: {
    id: 'johnlewis',
    name: 'John Lewis',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true, notes: 'Delivery estimate until retailer feed is connected' }),
  },
  tesco: {
    id: 'tesco',
    name: 'Tesco',
    membershipType: 'CLUBCARD',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true, notes: 'Delivery estimate until retailer feed is connected' }),
  },
  sainsburys: {
    id: 'sainsburys',
    name: "Sainsbury's",
    membershipType: 'NECTAR',
    estimateDelivery: ({ itemPrice, ctx }) => ({ cost: defaultDelivery(itemPrice, ctx), isEstimate: true, notes: 'Delivery estimate until retailer feed is connected' }),
  },
}
