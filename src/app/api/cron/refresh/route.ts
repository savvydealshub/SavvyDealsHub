import { NextResponse } from 'next/server'
import { clearFeedCache, getFeedCacheStatus } from '@/lib/products.server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)

  // Accept token from either ?token= or ?secret=
  const token = url.searchParams.get('token') ?? url.searchParams.get('secret')

  // Use CRON_SECRET if set, otherwise fallback to INGEST_SECRET
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
