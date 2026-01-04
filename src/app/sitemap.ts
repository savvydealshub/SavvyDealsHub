import type { MetadataRoute } from 'next'
import categories from '../data/categories.json'
import { site } from '../lib/config'

/**
 * Sitemap policy:
 * - Include only public, indexable pages.
 * - Exclude admin/auth/profile/private URLs and API routes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, '')
  const now = new Date()

  const staticPaths = [
    '/',
    '/compare',
    '/c',
    '/products',
    '/how-pricing-works',
    '/affiliate-disclosure',
    '/privacy',
    '/terms',
    '/about',
    '/contact',
    '/help',
  ]

  const categoryPaths = (categories as Array<{ slug: string }>).map((c) => `/c/${c.slug}`)

  const urls = [...staticPaths, ...categoryPaths]

  return urls.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : path.startsWith('/compare') ? 0.9 : path.startsWith('/c') ? 0.8 : 0.6,
  }))
}
