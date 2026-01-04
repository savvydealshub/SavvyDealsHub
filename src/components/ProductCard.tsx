import Image from 'next/image'
import Link from 'next/link'
import { affiliateUrl } from '../lib/affiliate'

type ProductCardProps = {
  p?: any
  product?: any
}

export default function ProductCard(props: ProductCardProps) {
  const p = props.product ?? props.p
  if (!p) return null

  const href = affiliateUrl(p.url)

  const price = Number(p.price ?? 0)
  const showPrice = Number.isFinite(price) && price > 0

  return (
    <div className="card">
      {p.imageUrl && (
        <div className="relative w-full h-40 mb-2 overflow-hidden rounded-xl">
          <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold line-clamp-2 flex-1">{p.title}</h3>
        {p.category ? (
          <Link
            href={`/c/${String(p.category).toLowerCase()}`}
            className="text-[11px] px-2 py-1 rounded-full bg-sdh-primary/10 text-sdh-primary dark:bg-slate-700 dark:text-sdh-text-dark whitespace-nowrap"
            title="Browse this category"
          >
            {String(p.category).replace(/-/g, ' ')}
          </Link>
        ) : null}
      </div>
      <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-3">{p.description}</p>
      <div className="mt-2 font-bold">
        {showPrice ? `£${price.toFixed(2)}` : 'Check price'}
      </div>
      <Link
        href={href}
        className="btn mt-3 inline-block text-center bg-black text-white"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Deal
      </Link>
    </div>
  )
}
