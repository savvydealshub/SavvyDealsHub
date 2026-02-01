import { NextResponse } from 'next/server'
import { paapiGetItems } from '@/lib/amazon-paapi.server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const asinsRaw = searchParams.get('asins') || ''
  const asins = asinsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10)

  if (asins.length === 0) {
    return NextResponse.json({ ok: true, items: [] })
  }

  try {
    const data = await paapiGetItems(asins)
    const items = Array.isArray(data?.ItemsResult?.Items) ? data.ItemsResult.Items : []

    const simplified = items.map((it: any) => {
      const asin = String(it?.ASIN || '')
      const title = String(it?.ItemInfo?.Title?.DisplayValue || '')
      const detailPageURL = String(it?.DetailPageURL || '')
      const imageUrl = it?.Images?.Primary?.Large?.URL ? String(it.Images.Primary.Large.URL) : ''

      const listing = Array.isArray(it?.Offers?.Listings) ? it.Offers.Listings[0] : null
      const priceValue = listing?.Price?.Amount != null ? Number(listing.Price.Amount) : null
      const currency = listing?.Price?.Currency ? String(listing.Price.Currency) : null

      return {
        asin,
        title,
        detailPageURL,
        imageUrl,
        price: priceValue != null && currency ? { value: priceValue, currency } : null,
      }
    })

    return NextResponse.json({ ok: true, items: simplified })
  } catch (e: any) {
    const msg = String(e?.message || e)
    // Keep this explicit: many accounts will not yet be eligible for PA-API access.
    if (msg.includes('PAAPI_NOT_CONFIGURED')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'PA_API_NOT_CONFIGURED',
          message:
            'Amazon PA-API is not configured (or not yet enabled on your Associates account). Set AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, and AMAZON_ASSOC_TAG in your server environment.',
        },
        { status: 503 }
      )
    }
    return NextResponse.json({ ok: false, error: 'PA_API_ERROR', message: msg }, { status: 500 })
  }
}
