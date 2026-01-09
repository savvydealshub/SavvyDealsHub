import { NextResponse } from 'next/server'
import { env } from '../../../../lib/config'
import { recordSnapshotsForAllOffers } from '../../../../lib/history/offersHistory.server'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token') ?? ''

  // Your config typing has env.cron.secret (NOT env.INGEST_SECRET)
  const secret = env?.cron?.secret ?? ''
  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // Must pass an object (not a number)
  const res = await recordSnapshotsForAllOffers({ take: 1000 })

  // Don't spread ok twice — return as-is
  return NextResponse.json(res)
}
