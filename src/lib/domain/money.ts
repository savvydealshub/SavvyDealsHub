export type CurrencyCode = 'GBP'

/**
 * Canonical money representation inside SavvyDealsHub.
 * - Store/compute in decimal pounds (2dp) for now.
 * - If you later need absolute precision, we can switch to integer minor units
 *   without changing UI code by keeping this interface stable.
 */
export type Money = {
  amount: number
  currency: CurrencyCode
}

export function gbp(amount: number): Money {
  return { amount: round2(amount), currency: 'GBP' }
}

export function add(a: Money, b: Money): Money {
  if (a.currency !== b.currency) throw new Error('Currency mismatch')
  return { amount: round2(a.amount + b.amount), currency: a.currency }
}

export function formatMoney(m: Money, symbol = '£'): string {
  return `${symbol}${m.amount.toFixed(2)}`
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
