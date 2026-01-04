import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '../../lib/config'
import { topLevel, childrenOf } from '../../lib/categories'

export const metadata: Metadata = {
  title: `Categories | ${site.name}`,
  description: `Browse product categories on ${site.name}. Find deals faster by starting with a category and then comparing true delivered prices.`,
  alternates: { canonical: `${site.url.replace(/\/$/, '')}/c` },
  openGraph: {
    title: `Categories | ${site.name}`,
    description: `Browse product categories on ${site.name}. Find deals faster by starting with a category.`,
    url: `${site.url.replace(/\/$/, '')}/c`,
    siteName: site.name,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name} — Smart deals` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Categories | ${site.name}`,
    description: `Browse product categories on ${site.name} and compare true delivered prices.`,
    images: ['/opengraph-image'],
  },
}

function Card({ href, title, subtitle }: { href: string; title: string; subtitle?: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-sdh-surface-dark/70"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p> : null}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">View →</span>
      </div>
    </Link>
  )
}

export default function CategoriesIndexPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${site.name} Categories`,
    itemListElement: topLevel.map((c, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: c.name,
      url: `${site.url.replace(/\/$/, '')}/c/${c.slug}`,
    })),
  }

  return (
    <div className="container py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Start with a category to find deals faster. You can always switch to{' '}
          <Link href="/compare" className="underline underline-offset-4">Compare (True Price)</Link> to calculate delivery and membership impact.
        </p>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topLevel.map((cat) => {
          const kids = childrenOf(cat.slug)
          const subtitle = kids.length ? `${kids.length} subcategories` : 'Browse deals'
          return <Card key={cat.slug} href={`/c/${cat.slug}`} title={cat.name} subtitle={subtitle} />
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-sdh-surface-dark/70">
        <h2 className="text-base font-semibold">How SavvyDealsHub ranks results</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Category pages help you explore what’s available. For the most accurate “to-your-door” total, use Compare to include delivery and
          retailer memberships (like Prime, Nectar or Clubcard) where applicable.{' '}
          <Link href="/how-pricing-works" className="underline underline-offset-4">Learn how pricing works</Link>.
        </p>
      </section>
    </div>
  )
}
