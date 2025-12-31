import { NextResponse } from 'next/server'
import { clearFeedCache, getFeedCacheStatus } from '@/lib/products.server'

export const dynamic = 'force-dynamic'

/**
 * Lightweight "cron" endpoint to refresh deals.
 * For JSON-only feeds, "refresh" just clears cache so the next request re-fetches.
 *
 * Usage:
 *  /api/cron/refresh?token=YOUR_SECRET
 *
 * Secret:
 *  - Prefer CRON_SECRET
 *  - Fallback to INGEST_SECRET
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token') ?? url.searchParams.get('secret')

  const expected = process.env.CRON_SECRET || process.env.INGEST_SECRET

  if (!expected) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET or INGEST_SECRET not set' }, { status: 500 })
  }

  if (!token || token !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  clearFeedCache()
  return NextResponse.json({ ok: true, message: 'cache cleared', status: getFeedCacheStatus() })
}
