import HexMenu from '../components/HexMenu'

const demoDeals = [
  { id: 1, badgeColor: '#ffb020' },
  { id: 2, badgeColor: '#ff6a1a' },
  { id: 3, badgeColor: '#22c55e' },
  { id: 4, badgeColor: '#f97316' },
]

export default function Home() {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {demoDeals.map((deal) => (
            <article key={deal.id} className="card flex flex-col gap-4 dark:bg-[#151820]">
              <div
                className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold text-white self-start"
                style={{ backgroundColor: deal.badgeColor }}
              >
                SAVE 30%
              </div>
              <div className="h-32 md:h-40 rounded-2xl bg-slate-100 dark:bg-[#1d212b] flex items-center justify-center">
                <span className="text-slate-400 text-sm dark:text-slate-500">
                  Product image
                </span>
              </div>
              <div>
                <button className="text-sdh-primary dark:text-sdh-text-dark font-semibold text-sm md:text-base hover:underline">
                  Product name
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
