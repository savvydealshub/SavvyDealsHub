import { NextResponse } from 'next/server'
import { getUiProducts } from '@/lib/products.server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('cat') || undefined
  const q = url.searchParams.get('q') || undefined
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '60', 10) || 60, 200)

  const products = await getUiProducts({ categorySlug: category, query: q, limit })
  return NextResponse.json({ products })
}
