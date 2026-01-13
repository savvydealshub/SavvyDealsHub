import { getClickTotals, getRecentClicks, getRetailerPerformance } from '@/lib/analytics/clicks.server'

export const metadata = {
  title: 'Analytics • SavvyDealsHub Admin',
  robots: { index: false, follow: false },
}

function fmtDate(d: Date) {
  return d.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function AdminAnalyticsPage() {
  const summary = await getClickTotals({ days: 30 })
  const recent = await getRecentClicks(50)
  const perf = await getRetailerPerformance({ days: summary.days })

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Revenue Intelligence</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Outbound click events (last {summary.days} days). GDPR-safe: no cookies, no IPs, no user agents.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total clicks</div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">{summary.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark md:col-span-3">
          <div className="text-sm font-medium">Top sources</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.topSources.length ? (
              summary.topSources.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span>{s.name}</span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">{s.clicks}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">No data yet.</span>
            )}
          </div>

          <div className="mt-4 text-sm font-medium">Top CTAs</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {summary.topCtas.length ? (
              summary.topCtas.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span>{s.name}</span>
                  <span className="tabular-nums text-slate-500 dark:text-slate-400">{s.clicks}</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">No data yet.</span>
            )}
          </div>
        </div>
      


<section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
  <h2 className="text-sm font-medium">Retailer performance</h2>
  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
    Trend compares the last 7 days vs the previous 7 days (clicks only).
  </p>
  <div className="mt-3 overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
          <th className="py-2 pr-3">Retailer</th>
          <th className="py-2 pr-3">Clicks (30d)</th>
          <th className="py-2 pr-3">Clicks (7d)</th>
          <th className="py-2 pr-3">Trend</th>
        </tr>
      </thead>
      <tbody>
        {perf.length ? (
          perf.slice(0, 12).map((r) => (
            <tr key={r.retailer} className="border-t border-slate-100 dark:border-slate-800">
              <td className="py-2 pr-3">{r.retailer}</td>
              <td className="py-2 pr-3 tabular-nums text-slate-600 dark:text-slate-300">{r.clicks30d}</td>
              <td className="py-2 pr-3 tabular-nums text-slate-600 dark:text-slate-300">{r.clicks7d}</td>
              <td className="py-2 pr-3 tabular-nums">
                <span className={r.delta7d >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                  {r.delta7d >= 0 ? '▲' : '▼'} {Math.abs(r.delta7d)} ({r.deltaPct7d}%)
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="py-2 text-xs text-slate-500 dark:text-slate-400" colSpan={4}>
              No data yet.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>

</div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <h2 className="text-sm font-medium">Top retailers</h2>
          <ol className="mt-3 space-y-2">
            {summary.topRetailers.length ? (
              summary.topRetailers.map((r) => (
                <li key={r.name} className="flex items-center justify-between text-sm">
                  <span>{r.name}</span>
                  <span className="tabular-nums text-slate-600 dark:text-slate-300">{r.clicks}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 dark:text-slate-400">No data yet.</li>
            )}
          </ol>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
          <h2 className="text-sm font-medium">Top categories</h2>
          <ol className="mt-3 space-y-2">
            {summary.topCategories.length ? (
              summary.topCategories.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-3">{c.name}</span>
                  <span className="tabular-nums text-slate-600 dark:text-slate-300">{c.clicks}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 dark:text-slate-400">No data yet.</li>
            )}
          </ol>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-sdh-surface-dark">
        <h2 className="text-sm font-medium">Recent clicks</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50 dark:bg-sdh-bg-dark/40">
              <tr className="text-left">
                <th className="p-2 w-[170px]">Time</th>
                <th className="p-2 w-[140px]">Source</th>
                <th className="p-2 w-[140px]">CTA</th>
                <th className="p-2 w-[160px]">Retailer</th>
                <th className="p-2 w-[200px]">Category</th>
                <th className="p-2">Offer</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="p-2 text-xs text-slate-600 dark:text-slate-300">{fmtDate(r.createdAt)}</td>
                    <td className="p-2">{r.source}</td>
                    <td className="p-2">{r.cta}</td>
                    <td className="p-2">{r.retailer}</td>
                    <td className="p-2">{r.category}</td>
                    <td className="p-2">
                      <a
                        href={r.offerUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="underline"
                        title={`Offer #${r.offerId}`}
                      >
                        {r.offerTitle}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-slate-500 dark:text-slate-400" colSpan={6}>
                    No clicks yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
