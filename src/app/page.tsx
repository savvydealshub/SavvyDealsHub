import type { Metadata } from 'next'
import HexMenu from '../components/HexMenu'
import CategoryGrid from '../components/CategoryGrid'
import FeaturedCategories from '../components/FeaturedCategories'
import CompareSearchForm from '../components/CompareSearchForm'
import { site } from '../lib/config'
import { getUiProducts } from '../lib/products.server'
import { getOfferCount, getUiOffersFromDb } from '../lib/offers.server'
import { computeShippingSanity, getDealShippingCap, partitionByDelivery } from '../lib/deals/shippingSanity'

export const metadata: Metadata = {
  title: `Smart deals & true-price comparison | ${site.name}`,
  description: `Compare real delivered prices (including delivery and retailer memberships like Prime/Nectar/Clubcard) and find the smartest deals with ${site.name}.`,
  alternates: { canonical: `${site.url.replace(/\/$/, '')}/` },
  openGraph: {
    title: `Smart deals & true-price comparison | ${site.name}`,
    description: `Compare real delivered prices and find the smartest deals with ${site.name}.`,
    url: `${site.url.replace(/\/$/, '')}/`,
    siteName: site.name,
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${site.name} — Smart deals` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Smart deals & true-price comparison | ${site.name}`,
    description: `Compare real delivered prices and find the smartest deals with ${site.name}.`,
    images: ['/opengraph-image'],
  },
}

export default async function Home() {
  // Pull deals from DB when available (uploaded CSV / authorised feeds), otherwise fall back to src/data/products-sample.json.
  // We also apply shipping sanity so "Top Deals" never shows extortionate delivery.
  let rawDeals: any[] = []
  try {
    const count = await getOfferCount()
    if (count > 0) {
      rawDeals = await getUiOffersFromDb({ categorySlug: 'deals', limit: 300 })
    }
  } catch {
    rawDeals = []
  }
  if (rawDeals.length === 0) {
    rawDeals = await getUiProducts({ categorySlug: 'deals', limit: 300 })
  }

  const { eligible, highDelivery } = partitionByDelivery(rawDeals as any)

  // Prefer items with known, sane delivery totals.
  // If some items have no price (hub pages), keep them.
  // Apply strict low-delivery defaults for the homepage "Top Deals" surface.
  // Bulky homeware (e.g. furniture) gets a slightly higher cap, but still blocks extortionate postage.
  const strictEligible = eligible.filter((p: any) => {
    const s = computeShippingSanity({ price: p.price, shippingPrice: p.shippingPrice, shippingIncluded: p.shippingIncluded, category: p.category })
    if (s.itemPrice == null) return true
    if (s.shippingUnknown) return false
    const cap = getDealShippingCap(p.category)
    return (s.shippingPrice ?? 0) <= cap
  })

  const sortedEligible = strictEligible
    .slice()
    .sort((a: any, b: any) => {
      const at = computeShippingSanity({ price: a.price, shippingPrice: a.shippingPrice, shippingIncluded: a.shippingIncluded, category: a.category }).totalPrice
      const bt = computeShippingSanity({ price: b.price, shippingPrice: b.shippingPrice, shippingIncluded: b.shippingIncluded, category: b.category }).totalPrice
      const aNum = at == null ? Number.POSITIVE_INFINITY : at
      const bNum = bt == null ? Number.POSITIVE_INFINITY : bt
      return aNum - bNum
    })

  const topDeals = sortedEligible.slice(0, 12)
  const filteredCount = highDelivery.length
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-black text-sdh-primary dark:text-sdh-text-dark">
          Find the smartest deals
        </h1>
        <p className="text-sdh-text-muted dark:text-sdh-text-dark/80">
          Browse popular categories and discover today&apos;s top offers.
        </p>

        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-soft dark:border-slate-800 dark:bg-sdh-surface-dark/60">
            <div className="mb-3 text-left">
              <div className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">TRUE PRICE COMPARE</div>
              <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                Compare the real price to your door (including delivery and memberships).
              </div>
            </div>
            <CompareSearchForm defaultLowDelivery />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <a href="/compare" className="btn px-5 py-2 rounded-full">
            Open full compare
          </a>
          <a
            href="/c"
            className="btn-outline px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800"
          >
            Browse categories
          </a>
          <a
            href="/how-pricing-works"
            className="text-sm text-sdh-text-muted dark:text-sdh-text-dark/80 underline underline-offset-4 self-center"
          >
            How pricing works
          </a>
        </div>

        <div className="pt-10">

          <HexMenu />
        </div>
      </section>

      <section className="container">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-sdh-primary dark:text-sdh-text-dark">
            Featured categories
          </h2>
          <a
            href="/c"
            className="text-sm text-sdh-text-muted dark:text-sdh-text-dark/80 underline underline-offset-4"
          >
            View all
          </a>
        </div>
        <FeaturedCategories />
      </section>

      <section className="container pb-16">
        <h2 className="text-2xl font-bold text-sdh-primary dark:text-sdh-text-dark mb-6">
          Today&apos;s Top Deals
        </h2>
        {filteredCount > 0 ? (
          <p className="-mt-4 mb-4 text-xs text-slate-500 dark:text-slate-400">
            We hid {filteredCount} offer{filteredCount === 1 ? '' : 's'} with unusually high delivery so Top Deals stays true to its name.
          </p>
        ) : null}
        {topDeals.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No deals loaded yet. Check back shortly.
          </p>
        ) : (
          <CategoryGrid products={topDeals} />
        )}
      </section>
    </div>
  )
}
