import { NextResponse } from 'next/server'

import { env } from '../../../../lib/config'
import { recordSnapshotsForAllOffers } from '../../../../lib/history/offersHistory.server'

export const dynamic = 'force-dynamic'

function isAuthed(req: Request) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : ''
  return Boolean(env.cron.secret) && token === env.cron.secret
}

// Creates a fresh snapshot for every Offer in the DB.
// Schedule this daily (or hourly) via your host's cron.
export async function GET(req: Request) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const res = await recordSnapshotsForAllOffers(1000)
  return NextResponse.json({ ok: true, ...res })
}
