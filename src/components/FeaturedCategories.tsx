import Link from 'next/link'
import { topLevel, childrenOf } from '../lib/categories'

const ICONS: Record<string, string> = {
  deals: '🔥',
  tech: '💻',
  home: '🏠',
  outdoors: '⛺',
  fashion: '👕',
  beauty: '💄',
  pets: '🐾',
}

function iconFor(slug: string) {
  return ICONS[slug] ?? '🏷️'
}

export default function FeaturedCategories() {
  // Prefer top-level categories (no parent). Show up to 8 tiles.
  const featured = topLevel.slice(0, 8)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {featured.map(c => {
        const children = childrenOf(c.slug)
        return (
          <Link
            key={c.slug}
            href={`/c/${c.slug}`}
            className="card group hover:shadow-soft transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-sdh-primary/10 flex items-center justify-center text-xl text-sdh-primary dark:bg-slate-700 dark:text-sdh-text-dark">
                {iconFor(c.slug)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sdh-text dark:text-sdh-text-dark group-hover:underline underline-offset-4">
                  {c.name}
                </div>
                <div className="text-xs text-sdh-text-muted dark:text-sdh-text-dark/70 mt-1 line-clamp-2">
                  {children.length > 0 ? `Includes ${children.slice(0, 3).map(x => x.name).join(', ')}${children.length > 3 ? '…' : ''}` : 'Browse the latest offers and comparisons'}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
