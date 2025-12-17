import type { Metadata } from 'next'
import categories from '../../../data/categories.json'
import products from '../../../data/products-sample.json'
import CategoryGrid from '../../../components/CategoryGrid'
import { site } from '../../../lib/config'

type CategoryPageProps = {
  params: { slug: string }
}

function getCategory(slug: string) {
  return (categories as any[]).find((c) => c.slug === slug)
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cat = getCategory(params.slug)

  const name = cat?.name ?? 'Category'
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
  const cat = getCategory(params.slug)
  if (!cat) return <div className="container py-10">Category not found.</div>

  const items = (products as any[]).filter((p) => String(p.category ?? '') === params.slug)

  return (
    <div className="container py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{cat.name}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Showing launch-mode products for this category. We can expand this later with full
          category trees and automated feeds.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">No products in this category yet.</p>
      ) : (
        <CategoryGrid products={items} />
      )}
    </div>
  )
}
