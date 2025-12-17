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

  return (
    <div className="card">
      {p.imageUrl && (
        <div className="relative w-full h-40 mb-2 overflow-hidden rounded-xl">
          <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
        </div>
      )}
      <h3 className="font-semibold line-clamp-2">{p.title}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-3">{p.description}</p>
      <div className="mt-2 font-bold">£{Number(p.price ?? 0).toFixed(2)}</div>
      <Link href={href} className="btn mt-3 inline-block text-center bg-black text-white">
        View Deal
      </Link>
    </div>
  )
}
