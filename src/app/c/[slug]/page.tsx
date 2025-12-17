import ProductCard from '@/components/ProductCard'
import categories from '@/data/categories.json'
import productsSample from '@/data/products-sample.json'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: { slug: string }; searchParams: { q?: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = (categories as Array<{ slug: string; name: string }>).find((c) => c.slug === params.slug)
  if (!cat) return { title: 'Category | SavvyDealsHub' }
  return {
    title: `${cat.name} Deals | SavvyDealsHub`,
    description: `Browse ${cat.name} deals and discounts.`,
  }
}

type Product = {
  sku: string
  title: string
  description: string
  price: number
  url: string
  imageUrl?: string
  category?: string
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const cat = (categories as Array<{ slug: string; name: string }>).find((c) => c.slug === params.slug)
  if (!cat) notFound()

  const q = (searchParams?.q || '').trim().toLowerCase()

  const products = (productsSample as Product[])
    .filter((p) => {
      const pc = (p.category || '').toLowerCase()
      return pc === cat.name.toLowerCase() || pc === cat.slug.toLowerCase()
    })
    .filter((p) => {
      if (!q) return true
      const hay = `${p.title} ${p.description} ${p.category || ''}`.toLowerCase()
      return hay.includes(q)
    })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{cat.name}</h1>
          <p className="text-sm text-zinc-500">{products.length} items</p>
        </div>
        <Link className="text-sm underline" href="/products">
          View all products
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.sku} product={p} />
        ))}
      </div>
    </main>
  )
}
