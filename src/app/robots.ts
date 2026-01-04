import type { MetadataRoute } from 'next'
import { site } from '../lib/config'

export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, '')
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads.txt'],
        disallow: [
          '/admin/',
          '/api/',
          '/login',
          '/register',
          '/profile',
          '/offer/',
          '/out',
          '/watchlist',
          '/support',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
