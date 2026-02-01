import { NextResponse } from 'next/server'
import { getEbayItem } from '@/lib/ebay.server'
import { affiliateUrl } from '@/lib/affiliate'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const itemId = (searchParams.get('itemId') || '').trim()
  if (!itemId) return NextResponse.json({ ok: false, error: 'MISSING_ITEM_ID' }, { status: 400 })

  try {
    const data = await getEbayItem(itemId)
    if (!data) return NextResponse.json({ ok: true, item: null })

    const itemWebUrl = data?.itemWebUrl ? String(data.itemWebUrl) : ''
    return NextResponse.json({
      ok: true,
      item: {
        itemId: String(data?.itemId || itemId),
        title: String(data?.title || ''),
        itemWebUrl,
        imageUrl: data?.image?.imageUrl ? String(data.image.imageUrl) : '',
        price: data?.price?.value != null && data?.price?.currency ? {
          value: Number(data.price.value),
          currency: String(data.price.currency),
        } : null,
        affiliateLink: itemWebUrl ? affiliateUrl(itemWebUrl) : '',
      },
    })
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
