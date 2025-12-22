import { NextResponse } from 'next/server'
import { env } from '@/lib/config'
import { db } from '@/lib/db'

type FeedProduct = {
  id: string
  title: string
  description?: string
  price?: number
  imageUrl?: string
  url: string
  category: string
  merchant?: string
}

async function loadFeed(): Promise<FeedProduct[]> {
  if (env.cron.dealsFeedUrl) {
    const res = await fetch(env.cron.dealsFeedUrl, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`)
    const data = await res.json()
    if (!Array.isArray(data)) throw new Error('Feed is not an array')
    return data
  }
  // Fallback to local bundled sample data.
  const local = await import('@/data/products-sample.json')
  return (local.default ?? local) as FeedProduct[]
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const expected = env.cron.secret ? `Bearer ${env.cron.secret}` : ''
  if (!env.cron.secret || auth !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const feed = await loadFeed()

  // Ensure categories exist
  const cats = new Set(feed.map(p => p.category).filter(Boolean))
  for (const slug of cats) {
    await db.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: slug.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase()) },
    })
  }

  let upserted = 0
  for (const p of feed) {
    if (!p?.id || !p?.title || !p?.url || !p?.category) continue
    await db.product.upsert({
      where: { sku: p.id },
      update: {
        title: p.title,
        description: p.description ?? '',
        price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
        imageUrl: p.imageUrl ?? null,
        url: p.url,
        merchant: p.merchant ?? 'Unknown',
        category: { connect: { slug: p.category } },
      },
      create: {
        sku: p.id,
        title: p.title,
        description: p.description ?? '',
        price: Number.isFinite(Number(p.price)) ? Number(p.price) : 0,
        imageUrl: p.imageUrl ?? null,
        url: p.url,
        merchant: p.merchant ?? 'Unknown',
        category: { connect: { slug: p.category } },
      },
    })
    upserted += 1
  }

  return NextResponse.json({ ok: true, upserted })
}

export async function GET() {
  // Lightweight health check
  return NextResponse.json({ ok: true })
}
