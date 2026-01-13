import type { Metadata } from 'next'

import { db } from '../../../lib/db'
import { computeOfferTotal, getOfferHistory } from '../../../lib/history/offersHistory.server'

export const dynamic = 'force-dynamic'

type Params = { id: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return { title: 'Offer history' }

  const offer = await db.offer.findUnique({ where: { id }, select: { title: true, retailer: true } })
  return {
    title: offer ? `Price history: ${offer.title} (${offer.retailer})` : 'Offer history',
    robots: { index: false, follow: true },
  }
}

export default async function OfferHistoryPage({ params }: { params: Params }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Offer history</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Invalid offer id.</p>
      </div>
    )
  }

  const offer = await db.offer.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      retailer: true,
      category: true,
      url: true,
      imageUrl: true,
      price: true,
      shippingPrice: true,
      shippingIncluded: true,
      updatedAt: true,
    },
  })

  if (!offer) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold">Offer history</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Offer not found.</p>
      </div>
    )
  }

  // ✅ FIX: computeOfferTotal expects ONE object argument
  const currentTotal = computeOfferTotal(offer)

  // History points can be shaped slightly differently depending on server version:
  // some versions return { capturedAt }, others { at }. We normalize to capturedAt.
  const rawHistory = await getOfferHistory(offer.id, 60)
  const history = (rawHistory as any[]).map((h) => ({
    ...h,
    capturedAt: h?.capturedAt ?? h?.at ?? h?.createdAt,
  }))

  const newest = history[0]?.total ?? null
  const oldest = history[history.length - 1]?.total ?? null
  const change = oldest != null && newest != null ? Math.round((newest - oldest) * 100) / 100 : null

  return (
    <div className="container py-10 space-y-6">
      <div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          <a className="underline" href={`/c/${encodeURIComponent(offer.category)}`}>
            {offer.category}
          </a>
          {' '}• {offer.retailer}
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Price history</h1>
        <p className="mt-1 text-slate-700 dark:text-slate-200">{offer.title}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <a
            href={offer.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center rounded-xl bg-sdh-primary px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            View on retailer
          </a>
          <a className="underline text-slate-600 dark:text-slate-300" href="/compare">
            Back to Compare
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <div className="text-xs text-slate-500 dark:text-slate-400">Current delivered total</div>
          <div className="mt-1 text-xl font-bold">{currentTotal == null ? '—' : `£${currentTotal.toFixed(2)}`}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Updated {new Date(offer.updatedAt).toLocaleDateString('en-GB')}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <div className="text-xs text-slate-500 dark:text-slate-400">Change (last {history.length} snapshots)</div>
          <div className="mt-1 text-xl font-bold">
            {change == null ? '—' : `${change > 0 ? '+' : ''}£${change.toFixed(2)}`}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Older → newer totals</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <div className="text-xs text-slate-500 dark:text-slate-400">Snapshots recorded</div>
          <div className="mt-1 text-xl font-bold">{history.length}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tip: schedule daily snapshots via <code>/api/cron/offer-snapshots</code>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-sdh-surface-dark">
        <div className="border-b border-slate-200 p-4 text-sm font-semibold dark:border-slate-800">Recent snapshots</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 dark:bg-sdh-bg-dark/40">
              <tr className="text-left">
                <th className="p-3">Captured</th>
                <th className="p-3">Item price</th>
                <th className="p-3">Shipping</th>
                <th className="p-3">Shipping included</th>
                <th className="p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr
                  key={(h.capturedAt ? new Date(h.capturedAt).toISOString() : `${offer.id}-${Math.random()}`) as string}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="p-3 text-slate-600 dark:text-slate-300">
                    {h.capturedAt ? new Date(h.capturedAt).toLocaleString('en-GB') : '—'}
                  </td>
                  <td className="p-3 tabular-nums">{h.price == null ? '—' : `£${Number(h.price).toFixed(2)}`}</td>
                  <td className="p-3 tabular-nums">
                    {h.shippingIncluded ? '—' : h.shippingPrice == null ? '—' : `£${Number(h.shippingPrice).toFixed(2)}`}
                  </td>
                  <td className="p-3">{h.shippingIncluded ? 'Yes' : 'No'}</td>
                  <td className="p-3 tabular-nums font-semibold">{h.total == null ? '—' : `£${Number(h.total).toFixed(2)}`}</td>
                </tr>
              ))}
              {history.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-slate-500 dark:text-slate-400" colSpan={5}>
                    No snapshots recorded yet. Upload a CSV offer feed or run the snapshots cron.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
