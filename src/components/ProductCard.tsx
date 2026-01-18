import Image from 'next/image'
import Link from 'next/link'
import { affiliateUrl } from '../lib/affiliate'
import { computeShippingSanity } from '../lib/deals/shippingSanity'

type ProductCardProps = {
  p?: any
  product?: any
}

export default function ProductCard(props: ProductCardProps) {
  const p = props.product ?? props.p
  if (!p) return null

  const href = affiliateUrl(p.url)

  const sanity = computeShippingSanity({
    price: p.price ?? null,
    shippingPrice: p.shippingPrice ?? null,
    shippingIncluded: p.shippingIncluded ?? null,
    category: p.category ?? null,
  })

  const showItemPrice = sanity.itemPrice != null
  const showTotal = sanity.totalPrice != null

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
      <div className="mt-2 space-y-1">
        {showTotal ? (
          <div className="font-bold text-lg">£{sanity.totalPrice!.toFixed(2)} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">total</span></div>
        ) : showItemPrice ? (
          <div className="font-bold">£{sanity.itemPrice!.toFixed(2)} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">item</span></div>
        ) : (
          <div className="font-bold">Check price</div>
        )}

        {/* Delivery badges */}
        {showItemPrice ? (
          <div className="flex flex-wrap gap-2 text-[11px]">
            {sanity.shippingUnknown ? (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Delivery unknown
              </span>
            ) : sanity.shippingPrice === 0 ? (
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                Free delivery
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Delivery £{(sanity.shippingPrice ?? 0).toFixed(2)}
              </span>
            )}

            {sanity.highDelivery ? (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-rose-900 dark:bg-rose-900/30 dark:text-rose-200" title={sanity.highDeliveryReason || ''}>
                High delivery
              </span>
            ) : null}
          </div>
        ) : null}

        {!showTotal && showItemPrice ? (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Tip: use <Link className="underline" href={`/compare?q=${encodeURIComponent(p.title ?? '')}`}>Compare</Link> to estimate delivery.
          </div>
        ) : null}
      </div>
      <Link
        href={href}
        className="btn mt-3 inline-block text-center bg-black text-white"
        target="_blank"
        rel="noopener noreferrer sponsored"
      >
        View Deal
      </Link>
    </div>
  )
}
