import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import fs from 'node:fs'
import path from 'node:path'

import { db } from '../../../lib/db'
import { parseCsv, rowsToObjects } from '../../../lib/csv'
import { getDbState } from '../../../lib/dbState'
import { computeShippingSanity } from '../../../lib/deals/shippingSanity'

// Prisma is Node-only. Being explicit avoids edge/runtime surprises on some hosts.
export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Admin: Feeds',
  robots: { index: false, follow: false },
}

type SearchParams = {
  ok?: string
  err?: string
  n?: string
  rej?: string
  fix?: string
  u?: string
  h?: string
}

function boolFrom(v: string | undefined): boolean {
  const s = (v ?? '').toLowerCase().trim()
  return s === '1' || s === 'true' || s === 'yes' || s === 'y'
}

function floatOrNull(v: string | undefined): number | null {
  const s = (v ?? '').trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function normalizeMembershipType(v: string | undefined): 'AMAZON_PRIME' | 'NECTAR' | 'CLUBCARD' | null {
  const s = (v ?? '').toLowerCase().replace(/\s+/g, '').trim()
  if (!s) return null
  if (s.includes('prime') || s === 'amazonprime') return 'AMAZON_PRIME'
  if (s.includes('nectar')) return 'NECTAR'
  if (s.includes('clubcard') || s.includes('tesco')) return 'CLUBCARD'
  return null
}

function normalizeCondition(v: string | undefined): 'New' | 'Used' | 'Refurbished' | 'Unknown' {
  const s = (v ?? '').toLowerCase().trim()
  if (!s) return 'Unknown'
  if (s.includes('refurb')) return 'Refurbished'
  if (s.includes('used') || s.includes('pre')) return 'Used'
  if (s.includes('new')) return 'New'
  return 'Unknown'
}



// Offer rules (shared by scripts + admin uploader).
type OfferRules = {
  maxPrice?: number
  allowedUrlPatterns?: string[]
  requireUkLikeDomain?: boolean
  dropIfUrlNotUkLike?: boolean
  enforceConditionNewOnly?: boolean
  requiredColumns?: string[]
  allowedEnums?: {
    yesNo?: string[]
    condition?: string[]
  }
  defaults?: {
    shippingIncluded?: string
    membershipRequired?: string
    isSponsored?: string
    sponsorLabel?: string
    membershipTypeIfRequired?: string
    condition?: string
  }
}

const DEFAULT_OFFER_RULES: OfferRules = {
  maxPrice: 100,
  allowedUrlPatterns: [],
  requireUkLikeDomain: true,
  dropIfUrlNotUkLike: false,
  enforceConditionNewOnly: false,
  requiredColumns: ['sku', 'title', 'url'],
  defaults: {
    shippingIncluded: 'No',
    membershipRequired: 'No',
    isSponsored: 'No',
    sponsorLabel: 'Sponsored',
    membershipTypeIfRequired: 'Prime',
    condition: 'New',
  },
}

function loadOfferRules(): OfferRules {
  const fp = path.join(process.cwd(), 'offer-rules.json')
  try {
    const raw = fs.readFileSync(fp, 'utf8')
    const parsed = JSON.parse(raw) as OfferRules
    return {
      ...DEFAULT_OFFER_RULES,
      ...parsed,
      defaults: {
        ...DEFAULT_OFFER_RULES.defaults,
        ...(parsed.defaults ?? {}),
      },
    }
  } catch {
    return DEFAULT_OFFER_RULES
  }
}

function urlMatchesAnyPattern(url: string, patterns: string[]) {
  const u = (url ?? '').toLowerCase()
  return patterns.some((p) => u.includes((p ?? '').toLowerCase()))
}

function urlLooksAllowedForRules(url: string, rules: OfferRules) {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase()
    // “UK-like” should not be restricted to only .co.uk/.uk.
    // Many legitimate UK retailers use .com with /gb paths (e.g., ikea.com/gb) or .com domains (e.g., johnlewis.com).
    const domainUkTld = host.endsWith('.co.uk') || host.endsWith('.uk')
    const patterns = rules.allowedUrlPatterns ?? []
    const patternOk = patterns.length > 0 ? urlMatchesAnyPattern(url, patterns) : false

    // Allow if either:
    // 1) URL matches an explicit allow-list pattern (covers .com/gb UK paths), OR
    // 2) UK TLD check passes when enabled.
    const allowByTld = !rules.requireUkLikeDomain ? true : domainUkTld
    return patternOk || allowByTld
  } catch {
    return false
  }
}

function parseYesNo(v: string | undefined): 'Yes' | 'No' | null {
  const s = (v ?? '').toLowerCase().trim()
  if (!s) return null
  if (['1', 'true', 'yes', 'y'].includes(s)) return 'Yes'
  if (['0', 'false', 'no', 'n'].includes(s)) return 'No'
  return null
}

function deriveRetailerFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('amazon')) return 'Amazon'
    if (host.includes('ebay')) return 'eBay'
    if (host.includes('argos')) return 'Argos'
    if (host.includes('currys')) return 'Currys'
    if (host.includes('johnlewis')) return 'John Lewis'
    if (host.includes('tesco')) return 'Tesco'
    if (host.includes('asda')) return 'ASDA'
    if (host.includes('sainsburys')) return 'Sainsbury\'s'
    if (host.includes('boots')) return 'Boots'
    if (host.includes('very.co.uk') || host.includes('very')) return 'Very'
    if (host.includes('ao.com') || host === 'ao.com') return 'AO'
    if (host.includes('screwfix')) return 'Screwfix'
    if (host.includes('toolstation')) return 'Toolstation'
    if (host.includes('ikea')) return 'IKEA'
    if (host.includes('wilko')) return 'Wilko'
    return 'Unknown'
  } catch {
    return 'Unknown'
  }
}
// Block only explicit adult-toy terms (site is not age-gated yet).
// Keep the list conservative to avoid false positives.
const EXPLICIT_BLOCKLIST = [
  /\bdildo\b/i,
  /\bvibrator\b/i,
  /\bflesh\s*light\b/i,
  /\bfleshlight\b/i,
  /\bbutt\s*plug\b/i,
  /\banal\s*plug\b/i,
  /\bsex\s*toy\b/i,
  /\badult\s*toy\b/i,
  /\bpenis\b/i,
  /\bvagina\b/i,
]

function hasExplicitAdultToyTerms(title: string, description: string): boolean {
  const text = `${title} ${description}`.trim()
  if (!text) return false
  return EXPLICIT_BLOCKLIST.some((re) => re.test(text))
}

async function uploadAction(formData: FormData) {
  'use server'

  const file = formData.get('file') as File | null
  if (!file) {
    redirect('/admin/feeds?err=' + encodeURIComponent('No file uploaded'))
  }

  const text = await file.text()
  const rows = parseCsv(text)
  const objs = rowsToObjects(rows)
  if (objs.length === 0) {
    redirect('/admin/feeds?err=' + encodeURIComponent('CSV appears empty (no data rows found)'))
  }

  // Supported headers (case-sensitive in the CSV, but we also accept common variants):
  // sku,title,description,category,retailer,url,imageUrl,price,shippingPrice,shippingIncluded,condition,membershipRequired,membershipType
  const get = (o: Record<string, string>, k: string) => o[k] ?? o[k.toLowerCase()] ?? o[k.toUpperCase()] ?? ''

  const rules = loadOfferRules()
  const defaults = rules.defaults ?? {}
  const maxPrice = typeof rules.maxPrice === 'number' ? rules.maxPrice : 100

  type FixOutcome =
    | { ok: true; row: any; fixedCells: number }
    | { ok: false; reason: string; sku?: string; title?: string; url?: string }

  const fixRow = (o: Record<string, string>): FixOutcome => {
    const sku = get(o, 'sku').trim()
    const title = get(o, 'title').trim()
    const url = get(o, 'url').trim()

    if (!sku || !title || !url) {
      return { ok: false, reason: `Missing required fields (sku, title, url)`, sku, title, url }
    }

    // URL allow-list (UK focused). Reject only if rules explicitly say to drop.
    const allowed = urlLooksAllowedForRules(url, rules)
    if ((rules.dropIfUrlNotUkLike ?? false) && !allowed) {
      return { ok: false, reason: `URL not allowed for UK rules`, sku, title, url }
    }

    let fixedCells = 0

    // Category default.
    let category = (get(o, 'category') || 'deals').trim().toLowerCase()
    if (!category) {
      category = 'deals'
      fixedCells++
    }

    // Retailer default (derive from URL if missing).
    let retailer = (get(o, 'retailer') || '').trim()
    if (!retailer) {
      retailer = deriveRetailerFromUrl(url)
      fixedCells++
    }

    const description = (get(o, 'description') || '').trim()
    if (hasExplicitAdultToyTerms(title, description)) {
      return { ok: false, reason: `Blocked explicit adult-toy content`, sku, title, url }
    }

    // Condition (auto-fix missing/invalid to default). If rules enforce new-only and row is explicitly not new, reject.
    let condition = normalizeCondition(get(o, 'condition'))
    if (condition === 'Unknown') {
      condition = normalizeCondition(defaults.condition)
      fixedCells++
    }
    if ((rules.enforceConditionNewOnly ?? false) && condition !== 'New') {
      return { ok: false, reason: `Condition not allowed (New-only policy)`, sku, title, url }
    }

    // Parse / normalize Yes/No fields.
    const shipIncRaw = parseYesNo(get(o, 'shippingIncluded')) ?? parseYesNo(defaults.shippingIncluded) ?? 'No'
    if (!get(o, 'shippingIncluded') && defaults.shippingIncluded) fixedCells++
    const shippingIncluded = shipIncRaw === 'Yes'

    const memReqRaw = parseYesNo(get(o, 'membershipRequired')) ?? parseYesNo(defaults.membershipRequired) ?? 'No'
    if (!get(o, 'membershipRequired') && defaults.membershipRequired) fixedCells++
    const membershipRequired = memReqRaw === 'Yes'

    const sponsoredRaw =
      parseYesNo(get(o, 'isSponsored')) ??
      parseYesNo(get(o, 'sponsored')) ??
      parseYesNo(defaults.isSponsored) ??
      'No'
    if ((!get(o, 'isSponsored') && !get(o, 'sponsored')) && defaults.isSponsored) fixedCells++
    const isSponsored = sponsoredRaw === 'Yes'

    let sponsorLabel = (get(o, 'sponsorLabel') || '').trim() || null
    if (isSponsored && !sponsorLabel) {
      sponsorLabel = (defaults.sponsorLabel || 'Sponsored').trim()
      fixedCells++
    }

    // Membership type: only required when membershipRequired is yes.
    let membershipType = normalizeMembershipType(get(o, 'membershipType'))
    if (membershipRequired && !membershipType) {
      membershipType = normalizeMembershipType(defaults.membershipTypeIfRequired) ?? 'AMAZON_PRIME'
      fixedCells++
    }

    // Price rules: reject if explicitly above max. If missing, keep null (allowed for hub/link-only rows).
    const price = floatOrNull(get(o, 'price'))
    if (price != null && price > maxPrice) {
      return { ok: false, reason: `Price above £${maxPrice} rule`, sku, title, url }
    }

    // Shipping price: if shipping is included, normalize to 0 when blank.
    let shippingPrice = floatOrNull(get(o, 'shippingPrice'))
    if (shippingIncluded && shippingPrice == null) {
      shippingPrice = 0
      fixedCells++
    }

    let imageUrl = (get(o, 'imageUrl' ) || get(o, 'image' ) || '').trim() || null
    if (imageUrl && (imageUrl.startsWith('[') || imageUrl.toUpperCase().includes('ADD_IMAGE_URL'))) {
      imageUrl = null
      fixedCells++
    }


    return {
      ok: true,
      fixedCells,
      row: {
        sku,
        title,
        description: description || null,
        category,
        retailer,
        url,
        imageUrl,
        price,
        shippingPrice,
        shippingIncluded,
        isSponsored,
        sponsorLabel,
        condition,
        membershipRequired,
        membershipType,
      },
    }
  }

  const outcomes = objs.map(fixRow)
  const rejected = outcomes.filter((o) => !o.ok) as Extract<FixOutcome, { ok: false }>[]
  const accepted = outcomes.filter((o) => o.ok) as Extract<FixOutcome, { ok: true }>[]

  if (accepted.length === 0) {
    const sample = rejected.slice(0, 6).map((r) => `${r.reason}${r.sku ? ` (sku=${r.sku})` : ''}`)
    redirect('/admin/feeds?err=' + encodeURIComponent(`No rows imported. ${sample.join(' | ')}`))
  }

  const good = accepted.map((a) => a.row)
  const fixedRows = accepted.filter((a) => a.fixedCells > 0).length
  const rejectedCount = rejected.length

  // Delivery sanity warnings (we still import, but these rows will not show on strict "Deals" paths by default).
  let warnUnknownDelivery = 0
  let warnHighDelivery = 0
  for (const r of good) {
    const s = computeShippingSanity({
      price: r.price,
      shippingPrice: r.shippingPrice,
      shippingIncluded: r.shippingIncluded,
    })
    if (s.itemPrice == null) continue
    if (s.shippingUnknown) warnUnknownDelivery++
    if (s.highDelivery) warnHighDelivery++
  }

  // Upsert-like behaviour via createMany + skipDuplicates (unique constraint: sku+retailer+url)
  try {
    await db.offer.createMany({
      data: good,
      skipDuplicates: true,
    })

    // Record a price snapshot for every offer referenced by this upload.
    // This gives us a baseline for "biggest drops" and trend views.
    const or = good.slice(0, 1500).map((r) => ({ sku: r.sku, retailer: r.retailer, url: r.url }))
    const offers = await db.offer.findMany({
      where: { OR: or },
      select: { id: true, price: true, shippingPrice: true, shippingIncluded: true },
    })
    if (offers.length) {
      await db.offerPriceSnapshot.createMany({
        data: offers.map((o) => ({
          offerId: o.id,
          price: o.price,
          shippingPrice: o.shippingPrice,
          shippingIncluded: o.shippingIncluded,
        })),
      })
    }
  } catch (e: any) {
    const msg = e?.message ?? 'Database error'
    redirect(
      '/admin/feeds?err=' +
        encodeURIComponent(
          `Upload failed. Have you updated the database schema? Run: npm run prisma:push. Details: ${msg}`
        )
    )
  }

  redirect(
    `/admin/feeds?ok=1&n=${good.length}&rej=${rejectedCount}&fix=${fixedRows}&u=${warnUnknownDelivery}&h=${warnHighDelivery}`
  )
}

async function clearAllOffersAction() {
  'use server'
  try {
    await db.offer.deleteMany({})
  } catch (e: any) {
    const msg = e?.message ?? 'Database error'
    redirect('/admin/feeds?err=' + encodeURIComponent(`Failed to clear offers. ${msg}`))
  }
  redirect('/admin/feeds?ok=1&n=0')
}

export default async function FeedsAdminPage({ searchParams }: { searchParams: SearchParams }) {
  const ok = searchParams.ok === '1'
  const err = (searchParams.err ?? '').toString().trim()
  const n = Number(searchParams.n ?? '0')
  const rej = Number(searchParams.rej ?? '0')
  const fix = Number(searchParams.fix ?? '0')
  const u = Number(searchParams.u ?? '0')
  const h = Number(searchParams.h ?? '0')

  const dbState = await getDbState(['Offer', 'OfferPriceSnapshot', 'Category'])
  let count = 0
  let dbReady = dbState.ready
  let byRetailer: Array<{ retailer: string; n: number }> = []
  let byCategory: Array<{ category: string; n: number }> = []
  if (dbReady) {
    try {
      count = await db.offer.count()
      const byRetailerRaw = await db.offer.groupBy({
        by: ['retailer'],
        _count: { retailer: true },
        orderBy: { _count: { retailer: 'desc' } },
        take: 8,
      })
      byRetailer = byRetailerRaw.map((r) => ({ retailer: r.retailer, n: r._count.retailer }))

      const byCategoryRaw = await db.offer.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 8,
      })
      byCategory = byCategoryRaw.map((c) => ({ category: c.category, n: c._count.category }))
    } catch {
      // If groupBy fails for any reason, keep the page usable.
    }
  }

  return (
    <div className="container py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CSV Feed Uploader</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Upload authorised CSV feeds to populate the <b>True Price Comparison</b> engine.
          <span className="block mt-1">
            This is an admin tool (no scraping). Use only feeds you own/control or are authorised to ingest.
          </span>
        </p>
      </div>

      {!dbReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
          Database connection is not ready for offers.
          <div className="mt-1">
            Run: <code className="px-1">npm run prisma:push</code> (or <code className="px-1">npx prisma migrate dev</code>)
          </div>
          {dbState.error ? <div className="mt-2 opacity-90">Details: {dbState.error}</div> : null}
          <div className="mt-2 opacity-90">
            Tables: {Object.entries(dbState.tables)
              .map(([k, v]) => `${k}:${v ? 'ok' : 'missing'}`)
              .join(' · ')}
          </div>
        </div>
      )}

      {ok && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200">
          Imported <b>{Number.isFinite(n) ? n : ''}</b> row{n === 1 ? '' : 's'} into the offers DB. Current DB offers: <b>{count}</b>
          <div className="mt-1 text-emerald-800 dark:text-emerald-200/90">
            Auto-fix mode is ON: we normalise missing Yes/No fields and sensible defaults. Duplicates are skipped automatically.
          </div>
          {(Number.isFinite(fix) && fix > 0) || (Number.isFinite(rej) && rej > 0) ? (
            <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-200/90">
              {Number.isFinite(fix) && fix > 0 ? (
                <>
                  Auto-fixed <b>{fix}</b> row{fix === 1 ? '' : 's'} (missing defaults like shippingIncluded / membership flags).
                </>
              ) : null}
              {fix > 0 && rej > 0 ? ' · ' : null}
              {Number.isFinite(rej) && rej > 0 ? (
                <>
                  Rejected <b>{rej}</b> row{rej === 1 ? '' : 's'} (e.g. non‑UK URL, over £100, or New‑only policy).
                </>
              ) : null}
            </div>
          ) : null}
          {(u > 0 || h > 0) ? (
            <div className="mt-2 text-xs text-emerald-800 dark:text-emerald-200/90">
              Delivery sanity note: {u > 0 ? <><b>{u}</b> row{u === 1 ? '' : 's'} had unknown delivery</> : null}{u > 0 && h > 0 ? ' · ' : null}{h > 0 ? <><b>{h}</b> row{h === 1 ? '' : 's'} had unusually high delivery</> : null}. These won't appear on strict "Top Deals" / "Home" paths by default.
            </div>
          ) : null}
        </div>
      )}

      {err && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-200">
          {err}
        </div>
      )}

      <form action={uploadAction} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-sdh-bg-dark/40">
        <div className="grid gap-3">
          <label className="text-sm font-semibold">CSV file</label>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            className="block w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-sdh-bg-dark"
            required
          />
          <button
            type="submit"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-sdh-teal px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95"
            disabled={!dbReady}
          >
            Upload feed
          </button>
          {!dbReady && (
            <div className="text-xs text-rose-700 dark:text-rose-300">
              Database table <code>Offer</code> not found. Run <code>npm run prisma:push</code> then refresh.
            </div>
          )}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-sdh-bg-dark/40">
          <div className="font-semibold">Quick stats</div>
          <div className="mt-2 text-slate-700 dark:text-slate-200">
            <div>
              DB offers: <b>{count}</b>
            </div>
            <div className="mt-3 font-semibold">Top retailers</div>
            <ul className="mt-1 list-disc pl-5">
              {byRetailer.length === 0 ? (
                <li className="text-slate-500">None yet</li>
              ) : (
                byRetailer.map((r) => (
                  <li key={r.retailer}>
                    {r.retailer}: {r.n}
                  </li>
                ))
              )}
            </ul>
            <div className="mt-3 font-semibold">Top categories</div>
            <ul className="mt-1 list-disc pl-5">
              {byCategory.length === 0 ? (
                <li className="text-slate-500">None yet</li>
              ) : (
                byCategory.map((c) => (
                  <li key={c.category}>
                    {c.category}: {c.n}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm dark:border-slate-800 dark:bg-sdh-bg-dark/40">
          <div className="font-semibold">Templates & maintenance</div>
          <p className="mt-2 text-slate-700 dark:text-slate-200">
            Download the CSV template, populate it, then upload above.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="/templates/offers-template.csv"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:bg-sdh-bg-dark dark:hover:bg-slate-900"
            >
              Download template CSV
            </a>
            <form action={clearAllOffersAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-100 dark:hover:bg-rose-900/30"
                disabled={!dbReady || count === 0}
              >
                Clear all offers
              </button>
            </form>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Clearing offers only affects comparison results sourced from the DB. Your site catalogue remains unchanged.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 dark:border-slate-800 dark:bg-sdh-bg-dark/40 dark:text-slate-200">
        <div className="font-semibold">CSV format (header row required)</div>
        <p className="mt-2">
          Minimum required columns: <code className="px-1">sku</code>, <code className="px-1">title</code>, <code className="px-1">url</code>.
          Recommended columns are listed below.
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><code>sku</code> (required) — your stable identifier</li>
          <li><code>title</code> (required)</li>
          <li><code>url</code> (required) — affiliate or authorised listing URL</li>
          <li><code>retailer</code> (recommended) — e.g. Amazon, Argos, eBay</li>
          <li><code>category</code> (recommended) — slug e.g. electronics, tools, deals</li>
          <li><code>price</code>, <code>shippingPrice</code>, <code>shippingIncluded</code></li>
          <li><code>condition</code> — New / Used / Refurbished</li>
          <li>
            <code>membershipRequired</code> (Yes/No) and <code>membershipType</code> (Prime/Nectar/Clubcard)
          </li>
          <li><code>imageUrl</code>, <code>description</code></li>
        </ul>
        <p className="mt-3">
          After upload, go to <code>/compare</code> and search — the comparison engine will use database offers if present.
        </p>
      </div>
    </div>
  )
}
