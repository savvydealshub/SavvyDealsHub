import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const runtime = 'edge'

export function GET() {
  const client = config.public.adsenseClient || ''
  const pub = client.startsWith('ca-pub-') ? client.replace('ca-pub-', 'pub-') : client
  // Standard Google AdSense seller entry. Keep this in sync with your AdSense account.
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache at CDN/edge but allow reasonably fast updates
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
