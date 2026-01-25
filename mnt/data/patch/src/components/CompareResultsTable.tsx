'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { CompareOffer } from '../lib/compare.server'

type Props = {
  offers: CompareOffer[]
  currency?: string
}

type SortKey = 'total' | 'item' | 'postage' | 'retailer'

function retailerTrustBadge(retailer: string): string | null {
  const r = retailer.toLowerCase()
  if (r.includes('amazon')) return 'Trusted retailer'
  if (r === 'ebay' || r.includes('ebay')) return 'Trusted marketplace'
  if (r.includes('argos')) return 'Trusted retailer'
  if (r.includes('currys')) return 'Trusted retailer'
  if (r.includes('john lewis')) return 'Trusted retailer'
  if (r.includes('tesco')) return 'Trusted retailer'
  if (r.includes('sainsbury') || r.includes('nectar')) return 'Trusted retailer'
  return null
}

function safeImageSrc(input: any): string {
  if (!input || typeof input !== "string") return ""
  const s = input.trim()
  if (!s) return ""
  if (s.startsWith("[")) return ""
  if (s.toUpperCase().includes("ADD_IMAGE_URL")) return ""
  if (s.startsWith("/")) return s
  if (s.startsWith("http://") || s.startsWith("https://")) return s
  return ""
}

export default function CompareResultsTable({ offers, currency = '£' }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [hideMembership, setHideMembership] = useState(false)
  const [hideUsed, setHideUsed] = useState(false)
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false)
  const [maxPostage, setMaxPostage] = useState<number | null>(null)
  const [maxTotal, setMaxTotal] = useState<number | null>(null)
  const [retailer, setRetailer] = useState<string>('all')
  const [onlyMyMemberships, setOnlyMyMemberships] = useState(false)
  const [primeOnly, setPrimeOnly] = useState(false)

  const searchParams = useSearchParams()
  useEffect(() => {
    // URL-driven filters (used by category “popular paths” links)
    const noMembership = searchParams.get('noMembership')
    const newOnly = searchParams.get('newOnly')
    const freeDelivery = searchParams.get('freeDelivery')
    const max = searchParams.get('max')
    const maxP = searchParams.get('maxPostage')
    const lowDelivery = searchParams.get('lowDelivery')
    const r = searchParams.get('retailer')
    const prime = searchParams.get('prime')
    const nectar = searchParams.get('nectar')
    const clubcard = searchParams.get('clubcard')
    if (noMembership === '1') setHideMembership(true)
    if (newOnly === '1') setHideUsed(true)
    if (freeDelivery === '1') setFreeDeliveryOnly(true)
    if (maxP) {
      const n = Number(maxP)
      if (Number.isFinite(n) && n >= 0) setMaxPostage(n)
    }
    // Convenience shortcut used by the homepage + strict category paths.
    if (lowDelivery === '1' && !maxP) setMaxPostage(4.99)
    if (r) setRetailer(r)
    if (max) {
      const n = Number(max)
      if (Number.isFinite(n) && n > 0) setMaxTotal(n)
    }

    // If the user has declared any memberships (Prime/Nectar/Clubcard), default to showing
    // offers that match those memberships. This keeps results "deal-relevant".
    const anyMembership = prime === '1' || nectar === '1' || clubcard === '1'
    if (anyMembership) setOnlyMyMemberships(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  const retailers = useMemo(() => {
    const set = new Set<string>()
    offers.forEach((o) => set.add(o.retailer))
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
  }, [offers])

  const filtered = useMemo(() => {
    const hasPrime = searchParams.get('prime') === '1'
    const hasNectar = searchParams.get('nectar') === '1'
    const hasClubcard = searchParams.get('clubcard') === '1'

    return offers.filter((o) => {
      if (hideMembership && o.membershipRequired) return false
      if (hideUsed && (o.condition === 'Used' || o.condition === 'Refurbished')) return false
      if (freeDeliveryOnly && (o.postagePrice == null || o.postagePrice > 0)) return false
      if (maxPostage != null && (o.postagePrice == null || o.postagePrice > maxPostage)) return false
      if (maxTotal != null && (o.totalPrice == null || o.totalPrice > maxTotal)) return false
      if (retailer !== 'all' && o.retailer !== retailer) return false

      // Membership-aware filtering:
      // - If enabled, hide offers that require a membership the user did not tick.
      // - If membership type is unknown, keep the offer (we can't safely decide).
      if (onlyMyMemberships && o.membershipRequired && o.membershipType) {
        if (o.membershipType === 'AMAZON_PRIME' && !hasPrime) return false
        if (o.membershipType === 'NECTAR' && !hasNectar) return false
        if (o.membershipType === 'CLUBCARD' && !hasClubcard) return false
      }

      // Optional: strict Amazon Prime-only view.
      if (primeOnly && o.membershipType !== 'AMAZON_PRIME') return false
      return true
    })
  }, [offers, hideMembership, hideUsed, freeDeliveryOnly, maxPostage, maxTotal, retailer, onlyMyMemberships, primeOnly, searchParams])

  const sorted = useMemo(() => {
    const list = filtered.slice()
    list.sort((a, b) => {
      if (sortKey === 'retailer') return a.retailer.localeCompare(b.retailer)
      const av =
        sortKey === 'total'
          ? a.totalPrice
          : sortKey === 'item'
            ? a.itemPrice
            : a.postagePrice
      const bv =
        sortKey === 'total'
          ? b.totalPrice
          : sortKey === 'item'
            ? b.itemPrice
            : b.postagePrice

      const aNum = av == null ? Number.POSITIVE_INFINITY : av
      const bNum = bv == null ? Number.POSITIVE_INFINITY : bv
      return aNum - bNum
    })
    return list
  }, [filtered, sortKey])

  const best = useMemo(() => {
    // "Best" = lowest total delivered price among currently filtered rows.
    const candidates = filtered.filter((o) => o.totalPrice != null)
    if (!candidates.length) return null
    let bestOffer = candidates[0]
    for (const c of candidates) {
      if ((c.totalPrice ?? Number.POSITIVE_INFINITY) < (bestOffer.totalPrice ?? Number.POSITIVE_INFINITY)) {
        bestOffer = c
      }
    }
    return bestOffer
  }, [filtered])

  const bestOfferId = useMemo(() => {
    // “Best value” = lowest total delivered price (when available)
    const candidates = filtered.filter((o) => o.totalPrice != null && o.offerId != null)
    if (!candidates.length) return null
    candidates.sort((a, b) => (a.totalPrice ?? 0) - (b.totalPrice ?? 0))
    return candidates[0].offerId ?? null
  }, [filtered])

  function formatUpdatedAt(value?: string) {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' })
  }

  const sponsoredCount = useMemo(() => offers.filter((o) => Boolean(o.isSponsored)).length, [offers])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">Sort by</div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
            >
              <option value="total">Total price</option>
              <option value="item">Item price</option>
              <option value="postage">Postage</option>
              <option value="retailer">Retailer</option>
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">Retailer</div>
            <select
              value={retailer}
              onChange={(e) => setRetailer(e.target.value)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
            >
              {retailers.map((r) => (
                <option key={r} value={r}>
                  {r === 'all' ? 'All retailers' : r}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hideUsed} onChange={(e) => setHideUsed(e.target.checked)} />
            New only
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hideMembership} onChange={(e) => setHideMembership(e.target.checked)} />
            Hide membership-required
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={freeDeliveryOnly} onChange={(e) => setFreeDeliveryOnly(e.target.checked)} />
            Free delivery only
          </label>

          <label className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-300">Max delivery</span>
            <input
              inputMode="numeric"
              placeholder="e.g. 4.99"
              value={maxPostage == null ? '' : String(maxPostage)}
              onChange={(e) => {
                const v = e.target.value.trim()
                if (!v) return setMaxPostage(null)
                const n = Number(v)
                setMaxPostage(Number.isFinite(n) && n >= 0 ? n : null)
              }}
              className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="text-slate-600 dark:text-slate-300">Max total</span>
            <input
              inputMode="numeric"
              placeholder="e.g. 50"
              value={maxTotal == null ? '' : String(maxTotal)}
              onChange={(e) => {
                const v = e.target.value.trim()
                if (!v) return setMaxTotal(null)
                const n = Number(v)
                setMaxTotal(Number.isFinite(n) ? n : null)
              }}
              className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyMyMemberships}
              onChange={(e) => setOnlyMyMemberships(e.target.checked)}
              disabled={
                searchParams.get('prime') !== '1' &&
                searchParams.get('nectar') !== '1' &&
                searchParams.get('clubcard') !== '1'
              }
              title="Tick Prime/Nectar/Clubcard above to enable this"
            />
            Match my memberships
          </label>

          {searchParams.get('prime') === '1' ? (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={primeOnly} onChange={(e) => setPrimeOnly(e.target.checked)} />
              Prime offers only
            </label>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-sdh-surface-dark">
        {best ? (
          <div className="flex flex-col gap-1 border-b border-slate-200 p-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-medium text-slate-900 dark:text-slate-100">Best delivered total right now:</span>{' '}
              {best.totalPrice == null ? '—' : `${currency}${best.totalPrice.toFixed(2)}`}{' '}
              <span className="text-slate-500 dark:text-slate-400">({best.retailer})</span>
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              Tip: use filters to compare like-for-like (new only, no membership, free delivery).
            </div>
          </div>
        ) : null}
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-slate-50 dark:bg-sdh-bg-dark/40">
            <tr className="text-left">
              <th className="p-3 w-[88px]">Image</th>
              <th className="p-3">Item link &amp; description</th>
              <th className="p-3 w-[140px]">Price of item</th>
              <th className="p-3 w-[160px]">Price of postage</th>
              <th className="p-3 w-[140px]">New / Used</th>
              <th className="p-3 w-[170px]">Membership required</th>
              <th className="p-3 w-[140px]">Total price</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => (
              <tr
                key={`${o.sku}-${o.retailer}-${o.url}`}
                className={
                  'border-t border-slate-100 dark:border-slate-800 ' +
                  (bestOfferId != null && o.offerId === bestOfferId
                    ? 'bg-emerald-50/60 dark:bg-emerald-900/10'
                    : '')
                }
              >
                <td className="p-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {(() => {
                      const imgSrc = safeImageSrc(o.imageUrl)
                      return imgSrc ? (
                        <Image src={imgSrc} alt={o.title} fill sizes="56px" className="object-cover" />
                      ) : null
                    })()}

                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-medium">{o.title}</div>
                    {bestOfferId != null && o.offerId === bestOfferId ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                        Best total
                      </span>
                    ) : null}
                    {o.postagePrice === 0 ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        Free delivery
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {o.retailer}
                    {formatUpdatedAt(o.updatedAt) ? (
                      <> • Updated {formatUpdatedAt(o.updatedAt)}</>
                    ) : null}{' '}
                    {retailerTrustBadge(o.retailer) ? (
                      <> • {retailerTrustBadge(o.retailer)}</>
                    ) : null}
                    {o.popularityTag ? <> • {o.popularityTag}</> : null}
                    {o.isSponsored ? (
                      <> • <span className="font-medium text-amber-700 dark:text-amber-300">{o.sponsorLabel || 'Sponsored'}</span></>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={
                        o.offerId
                          ? `/out?offerId=${encodeURIComponent(String(o.offerId))}&u=${encodeURIComponent(
                              String(o.url || '')
                            )}&src=compare&cta=${encodeURIComponent(bestOfferId != null && o.offerId === bestOfferId ? 'best' : 'row')}`
                          : o.url
                      }
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className={
                        'inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-medium shadow-sm transition ' +
                        (bestOfferId != null && o.offerId === bestOfferId
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-sdh-primary text-white hover:opacity-90')
                      }
                    >
                      {bestOfferId != null && o.offerId === bestOfferId ? 'Get best price' : 'View deal'}
                    </a>
                    <a href="/how-pricing-works" className="text-xs text-slate-500 underline">
                      How pricing works
                    </a>
                    {o.offerId ? (
                      <a href={`/offer/${encodeURIComponent(String(o.offerId))}`} className="text-xs text-slate-500 underline">
                        Price history
                      </a>
                    ) : null}
                  </div>
                  {o.description ? (
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{o.description}</div>
                  ) : null}
                </td>
                <td className="p-3 tabular-nums">{o.itemPrice == null ? '—' : `${currency}${o.itemPrice.toFixed(2)}`}</td>
                <td className="p-3 tabular-nums">
                  {o.postagePrice == null ? '—' : o.postagePrice === 0 ? 'Free' : `${currency}${o.postagePrice.toFixed(2)}`}
                  {o.deliveryNotes ? (
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      {o.deliveryNotes}{o.deliveryIsEstimate ? ' (estimate)' : ''}
                    </div>
                  ) : null}
                </td>
                <td className="p-3">{o.condition}</td>
                <td className="p-3">
                  {o.membershipRequired ? (
                    <div className="space-y-1">
                      <span
                        title={o.membershipLabel ?? ''}
                        className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                      >
                        Yes
                      </span>
                      {o.membershipLabel ? (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{o.membershipLabel}</div>
                      ) : null}
                    </div>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                      No
                    </span>
                  )}
                </td>
                <td className="p-3 tabular-nums font-semibold">
                  {o.totalPrice == null ? '—' : `${currency}${o.totalPrice.toFixed(2)}`}
                  {bestOfferId != null && o.offerId === bestOfferId ? (
                    <div className="mt-1 text-[11px] font-normal text-emerald-700 dark:text-emerald-300">
                      Lowest total delivered
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
            {sorted.length === 0 ? (
              <tr>
                <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={7}>
                  No results match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Delivery pricing shown here may be an estimate until retailer delivery APIs/feeds are connected. Membership-required
        means a retailer membership (e.g. Prime/Nectar/Clubcard) may be needed to access the best delivery/offer.{' '}
        <a className="underline" href="/how-pricing-works">
          How pricing works
        </a>
        {sponsoredCount > 0 ? (
          <> • <span className="text-amber-700 dark:text-amber-300">Sponsored offers</span> are clearly labelled.</>
        ) : null}
      </p>
    </div>
  )
}
