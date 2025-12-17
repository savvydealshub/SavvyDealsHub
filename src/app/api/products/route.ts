import { NextResponse } from 'next/server'
import productsSample from '@/data/products-sample.json'
import categories from '@/data/categories.json'

// This project is deployed as a static-first app on Amplify for the initial launch.
// Keeping this API route "build-safe" avoids failures when DATABASE_URL / other
// env vars aren't configured yet.
export const dynamic = 'force-static'
export const revalidate = 60 * 60 // 1 hour

type Product = {
  sku: string
  title: string
  description?: string
  price?: number
  url: string
  imageUrl?: string
  category?: string
}

function normalize(v?: string) {
  return (v ?? '').trim().toLowerCase()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = normalize(url.searchParams.get('q') ?? undefined)
  const categoryParam = normalize(url.searchParams.get('category') ?? undefined)

  const categoryName = categoryParam
    ? (categories as any[]).find((c) => normalize(c.slug) === categoryParam)?.name ?? null
    : null

  let items = (productsSample as Product[]).slice()

  if (categoryParam) {
    items = items.filter((p) => {
      const pc = normalize(p.category)
      return pc === categoryParam || (categoryName ? pc === normalize(categoryName) : false)
    })
  }

  if (q) {
    items = items.filter((p) => {
      const hay = normalize(`${p.title} ${p.description ?? ''} ${p.sku} ${p.category ?? ''}`)
      return hay.includes(q)
    })
  }

  return NextResponse.json({ items, total: items.length })
}
