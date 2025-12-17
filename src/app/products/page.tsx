import ProductCard from '@/components/ProductCard'
import productsSample from '@/data/products-sample.json'
import categories from '@/data/categories.json'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'All Products | SavvyDealsHub',
  description: 'Browse our curated deals and products.',
}

type SearchParams = {
  q?: string
  category?: string
}

type SampleProduct = {
  sku: string
  title: string
  description?: string
  price?: number
  url: string
  imageUrl?: string
  category?: string
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const q = normalize(searchParams.q ?? '')
  const categorySlug = normalize(searchParams.category ?? '')

  const slugToName = new Map(
    categories.map((c: any) => [normalize(c.slug), String(c.name)] as const)
  )
  const categoryName = categorySlug ? slugToName.get(categorySlug) : undefined

  const products = (productsSample as SampleProduct[])
    .filter((p) => {
      if (!q) return true
      const hay = `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
    .filter((p) => {
      if (!categorySlug) return true
      const pCat = normalize(p.category ?? '')
      // allow either category slug or category display name match
      return (
        pCat === categorySlug ||
        (categoryName ? pCat === normalize(categoryName) : false)
      )
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All products</h1>
        <p className="text-slate-600">
          Browse deals now. (We&apos;ll connect live product feeds after launch.)
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-2 text-sm ${
            !categorySlug
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
          }`}
        >
          All
        </Link>
        {categories.map((c: any) => (
          <Link
            key={c.slug}
            href={`/products?category=${encodeURIComponent(c.slug)}`}
            className={`rounded-full border px-4 py-2 text-sm ${
              categorySlug === normalize(c.slug)
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">
          No products matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.sku}
              product={{
                sku: p.sku,
                title: p.title,
                description: p.description ?? '',
                price: p.price ?? null,
                url: p.url,
                imageUrl: p.imageUrl ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
