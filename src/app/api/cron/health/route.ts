import { NextResponse } from 'next/server'
import { getFeedCacheStatus } from '@/lib/products.server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'CRON_SECRET not set' }, { status: 500 })
  }

  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ ok: true, status: getFeedCacheStatus(), ts: new Date().toISOString() })
}
