import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

export type UiProduct = {
  sku: string
  title: string
  description?: string
  price?: number
  imageUrl?: string
  url: string
  category: string
  // Optional: for member pricing
  shippingPrice?: number
  shippingIncluded?: boolean
  source?: string
}

type GetProductsArgs = {
  categorySlug?: string | null
  q?: string | null
  limit?: number | null
}

/**
 * JSON-only product provider.
 * - Reads local seed JSON (src/data/products-sample.json)
 * - Optionally merges remote JSON feeds you own/control (DEALS_FEED_URLS)
 * - Uses a simple in-memory TTL cache for remote feeds to keep it fast on Amplify.
 *
 * IMPORTANT: We intentionally do NOT "scan" arbitrary websites.
 * Only consume:
 *  - Your own feeds
 *  - Affiliate network feeds / APIs you are authorized to use
 */
const localProductsPath = path.join(process.cwd(), 'src', 'data', 'products-sample.json')

const cache: {
  fetchedAt: number
  items: UiProduct[]
  error?: string
} = {
  fetchedAt: 0,
  items: [],
}

function readLocalProducts(): UiProduct[] {
  try {
    const raw = fs.readFileSync(localProductsPath, 'utf-8')
    const parsed = JSON.parse(raw)
    // Support either:
    //  - { items: [...] }
    //  - [ ... ]
    const items = Array.isArray(parsed) ? parsed : parsed?.items
    return Array.isArray(items) ? items : []
  } catch {
    return []
  }
}

function envNumber(name: string, fallback: number) {
  const v = process.env[name]
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function envList(name: string): string[] {
  const v = (process.env[name] ?? '').trim()
  if (!v) return []
  return v.split(',').map(s => s.trim()).filter(Boolean)
}

async function fetchRemoteFeeds(): Promise<UiProduct[]> {
  const urls = envList('DEALS_FEED_URLS')
  if (urls.length === 0) return []

  const ttl = envNumber('DEALS_FEED_TTL_SECONDS', 1800) * 1000
  const now = Date.now()
  if (cache.items.length > 0 && now - cache.fetchedAt < ttl) return cache.items

  const merged: UiProduct[] = []
  const errors: string[] = []

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        errors.push(`${url} -> HTTP ${res.status}`)
        continue
      }
      const data = await res.json()
      const items = Array.isArray(data) ? data : data?.items
      if (Array.isArray(items)) {
        for (const it of items) {
          if (it?.sku && it?.title && it?.url && it?.category) {
            merged.push({ ...it, source: it.source ?? url })
          }
        }
      }
    } catch (e: any) {
      errors.push(`${url} -> ${e?.message ?? 'fetch failed'}`)
    }
  }

  cache.fetchedAt = now
  cache.items = merged
  cache.error = errors.length ? errors.join(' | ') : undefined
  return merged
}

function normalize(s: string) {
  return s.toLowerCase().trim()
}

export async function getUiProducts(args: GetProductsArgs = {}): Promise<UiProduct[]> {
  const local = readLocalProducts()
  const remote = await fetchRemoteFeeds()
  const all = [...remote, ...local]

  const q = args.q ? normalize(args.q) : ''
  const category = args.categorySlug ? normalize(args.categorySlug) : ''
  const limit = args.limit && args.limit > 0 ? args.limit : 200

  let filtered = all

  if (category) {
    // deals is a special "top picks" aggregator
    if (category !== 'deals') {
      filtered = filtered.filter(p => normalize(p.category) === category)
    }
  }

  if (q) {
    filtered = filtered.filter(p => {
      const hay = `${p.title ?? ''} ${p.description ?? ''} ${p.sku ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }

  // Basic ranking:
  // - If /c/deals: prefer items with price set (and lower prices), then recent ordering of JSON
  if (category === 'deals') {
    filtered = filtered
      .slice()
      .sort((a, b) => Number(a.price ?? 999999) - Number(b.price ?? 999999))
  }

  return filtered.slice(0, limit)
}

export function clearFeedCache() {
  cache.fetchedAt = 0
  cache.items = []
  cache.error = undefined
}

export function getFeedCacheStatus() {
  return { fetchedAt: cache.fetchedAt, count: cache.items.length, error: cache.error }
}

export type CategoryItem = {
  slug: string
  name: string
  count: number
}

/**
 * Returns category list derived from the current UI products.
 * Used by category pages /c/[slug].
 */
export async function getCategories(): Promise<CategoryItem[]> {
  const products = await getUiProducts({ limit: 2000 })

  const map = new Map<string, { name: string; count: number }>()
  for (const p of products) {
    const slug = (p.category || '').toString().trim()
    if (!slug) continue

    const cur = map.get(slug)
    if (cur) cur.count += 1
    else map.set(slug, { name: slug, count: 1 })
  }

  return Array.from(map.entries())
    .map(([slug, v]) => ({ slug, name: v.name, count: v.count }))
    .sort((a, b) => a.name.localeCompare(b.name))
}
