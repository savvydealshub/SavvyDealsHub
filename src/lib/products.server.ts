import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import { db } from './db'

export type UiProduct = {
  id: string
  title: string
  description?: string | null
  price: number
  imageUrl?: string | null
  url: string
  category: string
  merchant?: string | null
  updatedAt?: string | null
}

export type UiCategory = {
  slug: string
  name: string
  description?: string | null
}

function readJsonFile<T>(relative: string): T {
  const file = path.join(process.cwd(), relative)
  const raw = fs.readFileSync(file, 'utf-8')
  return JSON.parse(raw) as T
}

export async function getCategories(): Promise<UiCategory[]> {
  const jsonCats = readJsonFile<UiCategory[]>('src/data/categories.json')

  try {
    const dbCats = await db.category.findMany({
      orderBy: { name: 'asc' },
      select: { slug: true, name: true, description: true },
    })

    // If DB has categories, merge in any missing JSON categories (prevents missing routes like /c/deals)
    if (dbCats.length) {
      const seen = new Set(dbCats.map((c) => c.slug))
      const merged = [...dbCats]
      for (const c of jsonCats) {
        if (!seen.has(c.slug)) merged.push(c)
      }
      // Keep stable order
      return merged.sort((a, b) => a.name.localeCompare(b.name))
    }
  } catch {
    // ignore and fallback
  }

  return jsonCats
}

export async function getProducts(opts?: {
  categorySlug?: string
  q?: string
  limit?: number
}): Promise<UiProduct[]> {
  const categorySlug = opts?.categorySlug
  const q = opts?.q?.trim()
  const limit = Math.min(Math.max(opts?.limit ?? 60, 1), 200)

  try {
    const rows = await db.product.findMany({
      where: {
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        sku: true,
        title: true,
        description: true,
        price: true,
        imageUrl: true,
        url: true,
        merchant: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    })

    if (rows.length) {
      return rows.map((r) => ({
        id: r.sku,
        title: r.title,
        description: r.description,
        price: r.price,
        imageUrl: r.imageUrl,
        url: r.url,
        merchant: r.merchant,
        category: r.category.slug,
        updatedAt: r.updatedAt?.toISOString() ?? null,
      }))
    }
  } catch {
    // ignore and fallback
  }

  // Sample data can be either an array or an object like { items: [...] }
  const sampleRaw = readJsonFile<any>('src/data/products-sample.json')
  const sample: any[] = Array.isArray(sampleRaw)
    ? sampleRaw
    : Array.isArray(sampleRaw?.items)
      ? sampleRaw.items
      : []

  const filtered = sample.filter((p) => {
    if (categorySlug && p.category !== categorySlug) return false
    if (q && !(String(p.title ?? '').toLowerCase().includes(q.toLowerCase()) || String(p.description ?? '').toLowerCase().includes(q.toLowerCase()))) return false
    return true
  })
  return filtered.slice(0, limit)
}

// Backwards-friendly alias for calling code
export const getUiProducts = getProducts
