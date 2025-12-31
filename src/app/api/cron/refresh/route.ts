import { NextResponse } from 'next/server'
import { refreshProductsFromFeed } from '@/lib/products.server'

/**
 * Optional lightweight "cron" endpoint.
 *
 * NOTE: For security, set CRON_SECRET in your host env vars and call:
 *   /api/cron/refresh?secret=YOUR_SECRET
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')

  // If a secret is configured, require it.
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await refreshProductsFromFeed()
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
