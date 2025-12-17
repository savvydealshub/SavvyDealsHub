import { NextResponse } from 'next/server'
import products from '../../../data/products-sample.json'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') ?? '').toLowerCase().trim()
  const category = (searchParams.get('category') ?? '').toLowerCase().trim()

  const items = (products as any[]).filter((p) => {
    const matchesQ =
      !q ||
      String(p.title ?? '').toLowerCase().includes(q) ||
      String(p.description ?? '').toLowerCase().includes(q)

    const matchesCategory =
      !category || String(p.category ?? '').toLowerCase() === category

    return matchesQ && matchesCategory
  })

  return NextResponse.json({ items: items.slice(0, 48) })
}
