export function safeExternalImageUrl(input?: string | null): string | null {
  if (!input) return null
  if (typeof input !== 'string') return null
  const s = input.trim()
  if (!s) return null
  if (s.startsWith('[')) return null
  if (s.toUpperCase().includes('ADD_IMAGE_URL')) return null
  if (s.startsWith('/')) return s
  if (s.startsWith('https://') || s.startsWith('http://')) return s
  return null
}

export function fallbackImageUrl(opts?: { retailer?: string | null; category?: string | null }): string {
  const retailer = (opts?.retailer || '').toLowerCase()
  const category = (opts?.category || '').toLowerCase()

  // Retailer-first (helps hub pages)
  if (retailer.includes('amazon')) return '/images/fallback/amazon.svg'
  if (retailer.includes('ebay')) return '/images/fallback/ebay.svg'
  if (retailer.includes('argos')) return '/images/fallback/argos.svg'
  if (retailer.includes('currys')) return '/images/fallback/currys.svg'

  // Category next
  if (category.includes('tech') || category.includes('electronics')) return '/images/fallback/tech.svg'
  if (category.includes('home') || category.includes('clean')) return '/images/fallback/home.svg'
  if (category.includes('beauty')) return '/images/fallback/beauty.svg'
  if (category.includes('pets')) return '/images/fallback/pets.svg'
  if (category.includes('garden')) return '/images/fallback/garden.svg'
  if (category.includes('gaming')) return '/images/fallback/gaming.svg'
  if (category.includes('kitchen')) return '/images/fallback/kitchen.svg'
  if (category.includes('fitness')) return '/images/fallback/fitness.svg'

  if (category) return '/images/fallback/misc.svg'
  return '/images/fallback/default.svg'
}

export function offerImageUrl(opts: { imageUrl?: string | null; retailer?: string | null; category?: string | null }): string {
  return safeExternalImageUrl(opts.imageUrl) ?? fallbackImageUrl({ retailer: opts.retailer, category: opts.category })
}
