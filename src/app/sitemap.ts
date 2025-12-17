import type { MetadataRoute } from 'next'
import categories from '../data/categories.json'
import { site } from '../lib/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = site.url.replace(/\/$/, '')

  const routes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
  ]

  for (const cat of (categories as any[])) {
    routes.push({
      url: `${baseUrl}/c/${cat.slug}`,
      lastModified: new Date(),
    })
  }

  return routes
}
