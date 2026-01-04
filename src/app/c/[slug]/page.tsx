import type { Metadata } from 'next'
import Link from 'next/link'
import CategoryGrid from '../../../components/CategoryGrid'
import { site } from '../../../lib/config'
import { getUiProducts } from '../../../lib/products.server'
import { categories, childrenOf } from '../../../lib/categories'
import { getBiggestDropsByCategory } from '../../../lib/history/offersHistory.server'

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
  return categories.find((c) => c.slug === slug) ?? null
}

function siblingsOf(slug: string) {
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return []
  if (cat.parent) {
    return childrenOf(cat.parent).filter((c) => c.slug !== slug)
  }
  // top-level category: suggest other top-level categories
  return categories.filter((c) => !c.parent && c.slug !== slug)
}

function toNumberPrice(value: any): number {
  if (value == null) return Number.POSITIVE_INFINITY
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
  const s = String(value).replace(/[^0-9.]/g, '').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const cat = await getCategory(params.slug)
  const name = cat?.name ?? humanizeSlug(params.slug)

  const title = `${name} deals | ${site.name}`
  const description = `Browse the latest ${name} deals and compare true delivered price on ${site.name}.`

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
      locale: 'en_GB',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name} — Smart deals` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const cat = await getCategory(params.slug)
  const categoryName = cat?.name ?? humanizeSlug(params.slug)

  const all = await getUiProducts()
  const items = all.filter((p: any) => (p.category ?? '').toLowerCase() === categoryName.toLowerCase()).slice(0, 24)

  const subcats = childrenOf(params.slug)
  const subcatsWithCounts = subcats
    .map((s) => {
      const name = s.name ?? humanizeSlug(s.slug)
      const count = all.filter((p: any) => (p.category ?? '').toLowerCase() === name.toLowerCase()).length
      return { ...s, count }
    })
    .sort((a, b) => b.count - a.count)

  const topSubcats = subcatsWithCounts.slice(0, 10)
  const related = siblingsOf(params.slug).slice(0, 10)
  const cheapest = [...items]
    .sort((a: any, b: any) => toNumberPrice(a.price) - toNumberPrice(b.price))
    .slice(0, 6)

  const biggestDrops = await getBiggestDropsByCategory(params.slug, 7, 8)

  const baseUrl = site.url.replace(/\/$/, '')
  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: site.name, item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: `${baseUrl}/c` },
      { '@type': 'ListItem', position: 3, name: categoryName, item: `${baseUrl}/c/${params.slug}` },
    ],
  }

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does SavvyDealsHub calculate total price?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Category pages help you explore deals. For the most accurate total price to your door, use Compare (True Price) to include delivery and retailer membership benefits where applicable.',
        },
      },
      {
        '@type': 'Question',
        name: 'What does “Membership required” mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'It refers to retailer memberships such as Amazon Prime, Nectar, or Clubcard that can change delivery costs or unlock discounts. It is not a SavvyDealsHub membership.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are prices guaranteed to be final?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Retailers control final checkout pricing. We show the best available information from our authorised feeds and estimates where necessary. Always confirm at the retailer checkout.',
        },
      },
    ],
  }

  return (
    <div className="container py-10 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <header className="space-y-3">
        <h1 className="text-2xl font-bold">{categoryName}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Explore deals in <span className="font-medium">{categoryName}</span>. For the most accurate “to-your-door” total, use Compare to include delivery and retailer memberships.
          {' '}
          <Link href="/how-pricing-works" className="underline underline-offset-4">How pricing works</Link>.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}`}
            className="inline-flex items-center justify-center rounded-full bg-sdh-accent px-5 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
          >
            Compare {categoryName} (True Price)
          </Link>
          <Link
            href="/c"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/70 px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-sdh-surface-dark/70 dark:text-slate-100"
          >
            All categories
          </Link>
        </div>
      </header>


      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-sdh-surface-dark/70">
        <h2 className="text-base font-semibold">Popular paths</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Jump straight to high‑intent comparisons. These links pre‑apply useful filters on the Compare page.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}&max=50`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-sdh-bg-dark/40"
          >
            Under £50 (total)
          </Link>
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}&max=100`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-sdh-bg-dark/40"
          >
            Under £100 (total)
          </Link>
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}&freeDelivery=1`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-sdh-bg-dark/40"
          >
            Free delivery only
          </Link>
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}&noMembership=1`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-sdh-bg-dark/40"
          >
            No membership required
          </Link>
          <Link
            href={`/compare?q=${encodeURIComponent(categoryName)}&newOnly=1`}
            className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-sdh-bg-dark/40"
          >
            New only
          </Link>
        </div>
      </section>

      {topSubcats.length ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {topSubcats.map((s: any) => (
              <Link
                key={s.slug}
                href={`/c/${s.slug}`}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm hover:bg-white dark:border-slate-800 dark:bg-sdh-surface-dark/70"
              >
                {s.name}{typeof s.count === 'number' ? ` (${s.count})` : ''}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {biggestDrops.length ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Biggest drops (last 7 days)</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Based on snapshots recorded from your authorised offer feeds. These can improve as you schedule regular snapshots.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {biggestDrops.map((d) => (
              <div key={d.offerId} className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-sdh-surface-dark/70">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold line-clamp-2">{d.title}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.retailer}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Drop</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">£{d.drop.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <Link href={`/offer/${d.offerId}`} className="underline underline-offset-4">
                    View price history
                  </Link>
                  <Link
                    href={`/out?offerId=${encodeURIComponent(String(d.offerId))}&src=category&cta=drop`}
                    className="inline-flex items-center justify-center rounded-full bg-sdh-primary px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                  >
                    View deal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Related categories</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Explore nearby categories to find similar deals and compare delivered totals.
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/c/${r.slug}`}
                className="rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm hover:bg-white dark:border-slate-800 dark:bg-sdh-surface-dark/70"
              >
                {r.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {items.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-sdh-surface-dark/70">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We don’t have products indexed for this category yet. Upload authorised offers via{' '}
            <Link className="underline underline-offset-4" href="/admin/feeds">CSV feeds</Link> or try the Compare search.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <h2 className="text-base font-semibold">Featured deals</h2>
          <CategoryGrid products={items} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prices can change. For delivery and membership impact, click Compare.
          </p>
        </section>
      )}

      {cheapest.length ? (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-base font-semibold">Cheapest right now</h2>
            <Link className="text-sm underline underline-offset-4" href={`/compare?q=${encodeURIComponent(categoryName)}`}>
              Compare delivered totals
            </Link>
          </div>
          <CategoryGrid products={cheapest} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            These are based on item price only. Use Compare (True Price) to include delivery and retailer membership benefits.
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-sdh-surface-dark/70">
        <h2 className="text-base font-semibold">Questions</h2>
        <div className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium text-slate-900 dark:text-slate-100">How is total price calculated?</span> Use Compare (True Price) to include delivery and membership benefits.</p>
          <p><span className="font-medium text-slate-900 dark:text-slate-100">Does membership mean SavvyDealsHub membership?</span> No — it refers to retailer memberships like Prime, Nectar or Clubcard.</p>
          <p><span className="font-medium text-slate-900 dark:text-slate-100">Can I trust the price?</span> We use authorised feeds and show estimates where required. Always confirm at checkout.</p>
        </div>
      </section>
    </div>
  )
}
