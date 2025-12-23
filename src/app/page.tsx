import HexMenu from '../components/HexMenu'
import CategoryGrid from '../components/CategoryGrid'
import { getUiProducts } from '../lib/products.server'

export default async function Home() {
  // Pull real deals from DB if available, otherwise from src/data/products-sample.json
  const topDeals = await getUiProducts({ categorySlug: 'deals', limit: 12 })
  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 pt-10">
        <h1 className="text-3xl md:text-4xl font-black text-sdh-primary dark:text-sdh-text-dark">
          Find the smartest deals
        </h1>
        <p className="text-sdh-text-muted dark:text-sdh-text-dark/80">
          Browse popular categories and discover today&apos;s top offers.
        </p>

        <div className="max-w-3xl mx-auto">
          <form
            action="/products"
            method="GET"
            className="flex items-center gap-3 px-4 py-3 rounded-full bg-sdh-surface shadow-soft border border-slate-200/70 dark:bg-sdh-surface-dark dark:border-slate-800"
          >
            <div className="h-7 w-7 rounded-full bg-sdh-primary/10 flex items-center justify-center text-sdh-primary dark:bg-slate-700 dark:text-sdh-text-dark">
              🔍
            </div>
            <input
              type="text"
              name="q"
              placeholder="Search deals, products, brands..."
              className="flex-1 bg-transparent outline-none text-sm text-sdh-text dark:text-sdh-text-dark placeholder:text-sdh-text-muted dark:placeholder:text-slate-500"
            />
            <button type="submit" className="btn rounded-full px-4 py-2 text-sm">
              Search
            </button>
          </form>
        </div>

        <div className="pt-10">

          <HexMenu />
        </div>
      </section>

      <section className="container pb-16">
        <h2 className="text-2xl font-bold text-sdh-primary dark:text-sdh-text-dark mb-6">
          Today&apos;s Top Deals
        </h2>
        {topDeals.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No deals loaded yet. Check back shortly.
          </p>
        ) : (
          <CategoryGrid products={topDeals} />
        )}
      </section>
    </div>
  )
}
