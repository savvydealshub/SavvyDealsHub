import { NextResponse } from 'next/server'
import { searchEbay } from '@/lib/ebay.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()
  const limit = Number(searchParams.get('limit') || 12)

  if (!q) return NextResponse.json({ ok: true, items: [] })

  try {
    const items = await searchEbay(q, limit)
    return NextResponse.json({ ok: true, items })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.includes('EBAY_NOT_CONFIGURED')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'EBAY_NOT_CONFIGURED',
          message:
            'eBay API is not configured. Set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET in your server environment before using this endpoint.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ ok: false, error: 'EBAY_API_ERROR', message: msg }, { status: 500 })
  }
}
