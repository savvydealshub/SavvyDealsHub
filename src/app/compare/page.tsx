import type { Metadata } from 'next'
import { site } from '../../lib/config'
import CompareResultsTable from '../../components/CompareResultsTable'
import CompareSearchForm from '../../components/CompareSearchForm'
import { getUiProducts } from '../../lib/products.server'
import { getOfferCount, getUiOffersFromDb } from '../../lib/offers.server'
import { buildOffersFromProducts } from '../../lib/compare.server'
import { getClickTotals } from '../../lib/analytics/clicks.server'
import { categories } from '../../lib/categories'

export const metadata: Metadata = {
  title: 'Compare true prices',
  description:
    'Compare the real delivered price for products, including delivery estimates to your postcode and membership benefits like Prime, Nectar or Clubcard.',
  alternates: { canonical: `${site.url.replace(/\/$/, '')}/compare` },
}

type Props = {
  searchParams: {
    q?: string
    postcode?: string
    prime?: string
    nectar?: string
    clubcard?: string
  }
}

function normalize(s: string) {
  return (s ?? '').toLowerCase().trim()
}

function guessCategorySlug(qLower: string): string | null {
  const q = normalize(qLower)
  if (!q) return 'deals'

  // Common “generic compare” queries should map to your Deals surface.
  if (['topdeals', 'top deals', 'deals', 'offers', 'top offer', 'top offers', 'trending', 'best deals'].includes(q)) {
    return 'deals'
  }

  // Exact slug match
  const bySlug = categories.find((c) => normalize(c.slug) === q)
  if (bySlug) return bySlug.slug

  // Name match (e.g., "beauty" or "home")
  const byName = categories.find((c) => normalize(c.name) === q)
  if (byName) return byName.slug

  return null
}

export default async function ComparePage({ searchParams }: Props) {
  const q = (searchParams.q ?? '').trim()
  const qLower = normalize(q)
  const postcode = (searchParams.postcode ?? '').trim()
  const membership = {
    amazonPrime: searchParams.prime === '1',
    nectar: searchParams.nectar === '1',
    clubcard: searchParams.clubcard === '1',
  }

  // Prefer DB offers when available (populated via CSV uploader / authorised feeds).
  // IMPORTANT: Never fall back to the sample list if the DB contains offers — instead show latest offers.
  let products = [] as Awaited<ReturnType<typeof getUiProducts>>
  let usedDb = false
  let note = ''

  try {
    const count = await getOfferCount()
    if (count > 0) {
      usedDb = true

      const categorySlug = guessCategorySlug(qLower)

      if (categorySlug) {
        products = await getUiOffersFromDb({ categorySlug, limit: 800 })
        if (q && categorySlug !== qLower) {
          note = `Showing ${categorySlug} offers for “${q}”.`
        }
      } else if (qLower) {
        products = await getUiOffersFromDb({ q: qLower, limit: 800 })
      } else {
        products = await getUiOffersFromDb({ limit: 800 })
      }

      // If nothing matches, show latest offers (still from DB).
      if (products.length === 0) {
        products = await getUiOffersFromDb({ limit: 800 })
        if (qLower) note = `No exact matches for “${q}”. Showing latest offers instead.`
      }
    }
  } catch {
    // DB may be unavailable in local demo mode; fallback below.
    usedDb = false
  }

  if (!usedDb) {
    products = await getUiProducts({ q: qLower })
  }

  const offers = buildOffersFromProducts({ products, postcode, membership })

  // Data-driven trust signals (based on real outbound click behaviour).
  // If the DB isn't ready yet, this safely falls back to no badges.
  let popularRetailers = new Set<string>()
  try {
    const clickSummary = await getClickTotals({ days: 30 })
    popularRetailers = new Set(clickSummary.topRetailers.slice(0, 3).map((r) => r.name.toLowerCase()))
  } catch {
    popularRetailers = new Set()
  }

  const offersWithBadges = offers.map((o) => {
    const key = o.retailer.toLowerCase()
    if (popularRetailers.has(key)) return { ...o, popularityTag: 'Popular choice' }
    return o
  })

  const sourceNote = usedDb
    ? `Results are built from your live offers database. ${note}`.trim()
    : 'Results are using the built-in sample list (upload offers for real comparisons).'

  const faq = [
    {
      q: 'What does “Total price” include?',
      a: 'Total price is the item price plus delivery/postage to your postcode (where available). Some retailers may change delivery at checkout; we show estimates until live delivery feeds are connected.',
    },
    {
      q: 'What does “Membership required: Yes/No” mean?',
      a: 'This refers to a retailer membership (for example Amazon Prime, Nectar or Clubcard) that may be required to access the best delivery rate or offer. It is not a SavvyDealsHub membership.',
    },
    {
      q: 'Why can delivery be an estimate?',
      a: 'Some retailers provide delivery costs directly in authorised feeds/APIs; others don’t. Until live delivery sources are connected, we use transparent retailer rules and postcode bands to estimate delivery.',
    },
    {
      q: 'Do affiliate links affect the price shown?',
      a: 'No. Affiliate tracking does not change the price you pay. We aim to show the best value options based on the information available.',
    },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">True Price Comparison</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Search products and compare the real price to your door. Enter your postcode to estimate delivery, and tick any
          retailer memberships you have (Prime/Nectar/Clubcard).
        </p>
      </div>

      <CompareSearchForm
        initialQ={q}
        initialPostcode={postcode}
        initialPrime={membership.amazonPrime}
        initialNectar={membership.nectar}
        initialClubcard={membership.clubcard}
      />

      <p className="text-xs text-slate-500 dark:text-slate-400">{sourceNote}</p>

      <CompareResultsTable offers={offersWithBadges.slice(0, 200)} />

      {/* SEO-safe structured FAQ (adds trust without spam) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-sdh-surface-dark">
        <h2 className="text-lg font-semibold">FAQ</h2>
        <div className="mt-3 space-y-4">
          {faq.map((it) => (
            <div key={it.q} className="text-sm">
              <div className="font-medium">{it.q}</div>
              <div className="mt-1 text-slate-600 dark:text-slate-300">{it.a}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          More detail: <a className="underline" href="/how-pricing-works">How pricing works</a>.
        </p>
      </section>
    </div>
  )
}
