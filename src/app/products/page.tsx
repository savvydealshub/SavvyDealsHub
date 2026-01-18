import type { Metadata } from 'next'
import ProductCard from '../../components/ProductCard'
import categories from '../../data/categories.json'
import { site } from '../../lib/config'
import { getUiProducts } from '../../lib/products.server'
import { getOfferCount, getUiOffersFromDb } from '../../lib/offers.server'
import { partitionByDelivery } from '../../lib/deals/shippingSanity'

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse products and deals on SavvyDealsHub. Use Compare to calculate delivery and membership impact for the true total price.',
  alternates: { canonical: `${site.url.replace(/\/$/, '')}/products` },
}

type ProductsPageProps = {
  searchParams: {
    q?: string
    category?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const q = (searchParams.q ?? '').trim().toLowerCase()
  const categorySlug = (searchParams.category ?? '').trim().toLowerCase()

  // Prefer DB offers when available (uploaded CSV / authorised feeds).
  let products: any[] = []
  try {
    const count = await getOfferCount()
    if (count > 0) {
      products = await getUiOffersFromDb({ q, categorySlug, limit: 400 })
    }
  } catch {
    products = []
  }
  if (products.length === 0) {
    products = await getUiProducts({ q: q || undefined, categorySlug: categorySlug || undefined, limit: 400 })
  }

  // Hide extreme delivery costs by default (still viewable in Compare).
  const { eligible, unknownDelivery } = partitionByDelivery(products as any)
  const filtered = [...eligible, ...unknownDelivery].slice(0, 60)

  const categoryOptions = (categories as any[])
    .filter((c) => !c.parent)
    .map((c) => ({ slug: c.slug, name: c.name }))

  return (
    <div className="container py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">All products</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Live product listing. Products are served from your database when configured, and fall
          back to the bundled sample feed if the database is unavailable.
        </p>
      </header>

      <form className="flex flex-col sm:flex-row gap-3 max-w-2xl" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Search by name or description"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                     dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
        />

        <select
          name="category"
          defaultValue={searchParams.category ?? ''}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                     dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
        >
          <option value="">All categories</option>
          {categoryOptions.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>

        <button type="submit" className="btn">
          Search
        </button>
      </form>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">No products matched that query.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.slice(0, 48).map((p) => (
            <ProductCard key={p.sku ?? p.title} p={p} />
          ))}
        </div>
      )}
    </div>
  )
}
