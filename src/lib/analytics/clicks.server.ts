import 'server-only'

import { db } from '@/lib/db'

export async function getClickTotals(opts: { days?: number } = {}) {
  const days = opts.days ?? 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const total = await db.clickEvent.count({ where: { createdAt: { gte: since } } })

  const topRetailers = await db.clickEvent.groupBy({
    by: ['retailer'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const topCategories = await db.clickEvent.groupBy({
    by: ['category'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const topSources = await db.clickEvent.groupBy({
    by: ['source'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  const topCtas = await db.clickEvent.groupBy({
    by: ['cta'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  return {
    days,
    total,
    topRetailers: topRetailers.map((r) => ({ name: r.retailer, clicks: r._count.id })),
    topCategories: topCategories.map((c) => ({ name: c.category, clicks: c._count.id })),
    topSources: topSources.map((s) => ({ name: s.source ?? 'unknown', clicks: s._count.id })),
    topCtas: topCtas.map((c) => ({ name: c.cta ?? 'default', clicks: c._count.id })),
  }
}

export async function getRecentClicks(limit = 50) {
  const rows = await db.clickEvent.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { offer: true },
  })

  return rows.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    retailer: r.retailer,
    category: r.category,
    source: r.source ?? 'unknown',
    cta: r.cta ?? 'default',
    offerId: r.offerId,
    offerTitle: r.offer.title,
    offerUrl: r.offer.url,
  }))
}

export async function getRetailerPerformance(opts: { days?: number } = {}) {
  const days = opts.days ?? 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const last30 = await db.clickEvent.groupBy({
    by: ['retailer'],
    where: { createdAt: { gte: since } },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 50,
  })

  const last7 = await db.clickEvent.groupBy({
    by: ['retailer'],
    where: { createdAt: { gte: since7 } },
    _count: { id: true },
  })

  const prev7 = await db.clickEvent.groupBy({
    by: ['retailer'],
    where: { createdAt: { gte: since14, lt: since7 } },
    _count: { id: true },
  })

  const m7 = new Map(last7.map((r) => [r.retailer, r._count.id]))
  const p7 = new Map(prev7.map((r) => [r.retailer, r._count.id]))

  return last30.map((r) => {
    const l7 = m7.get(r.retailer) ?? 0
    const pr = p7.get(r.retailer) ?? 0
    const delta = l7 - pr
    const pct = pr === 0 ? (l7 > 0 ? 100 : 0) : Math.round((delta / pr) * 100)
    return {
      retailer: r.retailer,
      clicks30d: r._count.id,
      clicks7d: l7,
      prev7d: pr,
      delta7d: delta,
      deltaPct7d: pct,
    }
  })
}
