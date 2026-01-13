import { NextResponse } from 'next/server'
import { site } from '@/lib/config'

export const runtime = 'edge'

export function GET() {
  // AdSense uses your publisher ID, typically derived from the client like:
  //   client: ca-pub-123...
  //   ads.txt: pub-123...
  const client = site.adsenseClient || ''
  const pub = client.startsWith('ca-pub-') ? client.replace('ca-pub-', 'pub-') : client

  // Standard Google AdSense seller entry.
  // If you use additional ad networks/SSPs later, append additional lines.
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : ''

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache at CDN/edge but allow reasonably fast updates
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
