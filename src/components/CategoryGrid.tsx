import ProductCard from './ProductCard'

export default function CategoryGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map(p => <ProductCard key={p.sku ?? p.offerId ?? p.id ?? p.title} p={p} />)}
    </div>
  )
}
