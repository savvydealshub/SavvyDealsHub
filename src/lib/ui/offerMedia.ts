// Centralised helpers to keep UI resilient when offers contain incomplete/placeholder data.

function norm(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase() : ''
}

export function fallbackImageFor(category?: unknown, retailer?: unknown): string {
  const c = norm(category)
  const r = norm(retailer)

  // Retailer-specific first (helps when category is missing).
  if (r.includes('amazon')) return '/images/fallback/retailer-amazon.svg'
  if (r.includes('ebay')) return '/images/fallback/retailer-ebay.svg'

  // Category buckets (keep small and stable).
  if (c.includes('tech') || c.includes('electronics') || c.includes('computer')) return '/images/fallback/cat-tech.svg'
  if (c.includes('home') || c.includes('kitchen') || c.includes('garden')) return '/images/fallback/cat-home.svg'
  if (c.includes('beauty') || c.includes('health')) return '/images/fallback/cat-beauty.svg'
  if (c.includes('pet')) return '/images/fallback/cat-pets.svg'
  if (c.includes('fashion') || c.includes('apparel') || c.includes('clothing')) return '/images/fallback/cat-fashion.svg'

  return '/images/fallback/default.svg'
}

export function safeOfferImageUrl(
  input: unknown,
  opts?: { category?: unknown; retailer?: unknown }
): string {
  const fallback = fallbackImageFor(opts?.category, opts?.retailer)

  if (!input || typeof input !== 'string') return fallback
  const s = input.trim()
  if (!s) return fallback

  // Template placeholders / bad data.
  if (s.startsWith('[')) return fallback
  if (s.toUpperCase().includes('ADD_IMAGE_URL')) return fallback

  // Valid relative asset or absolute URL.
  if (s.startsWith('/')) return s
  if (s.startsWith('http://') || s.startsWith('https://')) return s

  return fallback
}

export function safeExternalUrl(input: unknown): string | null {
  if (!input || typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null
  if (s.startsWith('[') || s.includes('ADD_AFFILIATE_URL') || s.includes('[ADD_')) return null
  try {
    const u = new URL(s)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return u.toString()
  } catch {
    return null
  }
}
