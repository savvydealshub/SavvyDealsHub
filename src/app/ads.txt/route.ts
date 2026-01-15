import { NextResponse } from 'next/server'

// NOTE: Keep this as a Node.js route (default). Some hosts don’t fully support
// Edge runtime + env var access for file-like routes such as /ads.txt.
// (If you later move to a host with full Edge support, you can re-enable Edge.)

function toPubId(input: string): string {
  const v = (input || '').trim()
  if (!v) return ''
  // Accept either format:
  //  - ca-pub-123... (used by AdSense script/meta)
  //  - pub-123...    (used by ads.txt)
  if (v.startsWith('pub-')) return v
  if (v.startsWith('ca-pub-')) return v.replace('ca-pub-', 'pub-')
  // If someone pasted just the number, convert it.
  if (/^\d+$/.test(v)) return `pub-${v}`
  return v
}

export function GET() {
  // Read from env at request time so it works even if the value was added/changed
  // after a previous build (you still need a redeploy for client-side changes).
  const rawClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT ||
    process.env.ADSENSE_CLIENT ||
    process.env.ADSENSE_PUBLISHER_ID ||
    ''

  const pub = toPubId(rawClient)

  // Standard Google AdSense seller entry.
  // If you use additional ad networks/SSPs later, append additional lines.
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '# SavvyDealsHub ads.txt not configured yet\n'

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cache at CDN but allow reasonably fast updates
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
