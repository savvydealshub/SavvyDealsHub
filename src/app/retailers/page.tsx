import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getRetailerCatalog } from '@/lib/retailers/catalog'

export const metadata = {
  title: 'Retailers | SavvyDealsHub',
  description: 'Browse offers by retailer and discover where the best deals are coming from.',
}

function normKey(v: string) {
  return (v || '').trim().toLowerCase()
}

export default async function RetailersPage() {
  const catalog = getRetailerCatalog()

  // Count offers by retailer
  const grouped = await prisma.offer.groupBy({
    by: ['retailer'],
    where: { status: 'active' },
    _count: { _all: true },
    orderBy: { _count: { _all: 'desc' } },
  })

  const items = grouped
    .map((g) => {
      const key = normKey(g.retailer)
      const meta = catalog[key]
      return {
        retailer: g.retailer,
        key,
        count: g._count._all,
        website: meta?.website,
        notes: meta?.notes,
      }
    })
    .filter((i) => i.retailer)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Retailers</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We list deals from multiple retailers. Click a retailer to jump into Compare and search for them.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <div
            key={r.key}
            className="rounded-2xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-medium">{r.retailer}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.count} offer{r.count === 1 ? '' : 's'}</div>
              </div>

              <Link
                className="rounded-xl border px-3 py-1 text-sm hover:bg-accent"
                href={`/compare?q=${encodeURIComponent(r.retailer)}`}
              >
                View
              </Link>
            </div>

            {r.website ? (
              <div className="mt-3 text-sm">
                <a className="underline" href={r.website} rel="noreferrer" target="_blank">
                  Visit retailer site
                </a>
              </div>
            ) : null}

            {r.notes ? (
              <div className="mt-2 text-xs text-muted-foreground">{r.notes}</div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">Tip</div>
        <div className="mt-1">
          While you’re waiting for Skimlinks approval, you can still add retailer offers using the normal (non-affiliate) URLs.
          Once Skimlinks is approved and the script is installed, many outbound links will auto-monetize.
        </div>
      </div>
    </main>
  )
}
