import Link from 'next/link'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Retailers | SavvyDealsHub',
  description: 'Browse retailers available on SavvyDealsHub.',
}

export default async function RetailersPage() {
  // Prisma groupBy ordering: OfferCountOrderByAggregateInput does not support _all in orderBy.
  // Since we group by retailer, counting any non-null field in the group gives the group size.
  // We count "retailer" and order by that count.
  const grouped = await prisma.offer.groupBy({
    by: ['retailer'],
    _count: { retailer: true },
    orderBy: { _count: { retailer: 'desc' } },
  })

  const rows = grouped
    .map((g) => ({
      retailer: g.retailer ?? 'Unknown',
      count: g._count?.retailer ?? 0,
    }))
    .filter((r) => r.retailer && r.retailer !== 'Unknown')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Retailers</h1>
        <Link href="/" className="text-sm underline underline-offset-4">
          Back to deals
        </Link>
      </div>

      <p className="mb-6 text-sm text-muted-foreground">
        This list is generated from your current offers database. Retailer feeds/APIs can be connected over time (Amazon, eBay, etc.).
      </p>

      <div className="rounded-2xl border">
        <div className="grid grid-cols-12 gap-3 border-b px-4 py-3 text-xs font-medium text-muted-foreground">
          <div className="col-span-8">Retailer</div>
          <div className="col-span-4 text-right">Offers</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">
            No retailers found yet — add offers and they’ll appear here.
          </div>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.retailer} className="grid grid-cols-12 gap-3 px-4 py-3">
                <div className="col-span-8">
                  <span className="font-medium">{r.retailer}</span>
                </div>
                <div className="col-span-4 text-right tabular-nums">{r.count}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
