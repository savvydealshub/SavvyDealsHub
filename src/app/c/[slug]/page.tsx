import type { Metadata } from 'next'
import CategoryGrid from '../../../components/CategoryGrid'
import { site } from '../../../lib/config'
import { getUiProducts } from '../../../lib/products.server'

function humanizeSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

type CategoryPageProps = {
  params: { slug: string }
}

async function getCategory(slug: string) {
  // Lazy import keeps this as a server-only dependency.
  const { getCategories } = await import('../../../lib/products.server')
  const cats = await getCategories()
  return cats.find((c) => c.slug === slug) || null
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cat = await getCategory(params.slug)

  const name = cat?.name ?? humanizeSlug(params.slug)
  const title = `${name} deals | ${site.name}`
  const description = `Browse the latest ${name} deals on ${site.name}.`

  const baseUrl = site.url.replace(/\/$/, '')
  const url = `${baseUrl}/c/${params.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const cat = await getCategory(params.slug)
  const categoryName = cat?.name ?? humanizeSlug(params.slug)

  const items = await getUiProducts({ categorySlug: params.slug, limit: 60 })
  const fallback = items.length === 0 ? await getUiProducts({ categorySlug: 'deals', limit: 24 }) : []

  return (
    <div className="container py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{categoryName}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing products for this category. Outbound links can be wrapped with your affiliate
          template once your network accounts are approved.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We don't have products indexed for this category yet.
          </p>
          {fallback.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Popular deals</h2>
              <CategoryGrid products={fallback} />
            </div>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Tip: try <a className="underline" href="/products">All products</a> or use the search.
          </p>
        </div>
      ) : (
        <CategoryGrid products={items} />
      )}
    </div>
  )
}
