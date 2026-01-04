import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Pricing Works',
  description: 'How SavvyDealsHub calculates item price, delivery costs, and membership‑based totals.',
}

export default function HowPricingWorksPage() {
  return (
    <section className="container max-w-3xl py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">How pricing works</h1>
        <p className="text-sm text-gray-600">
          SavvyDealsHub helps you compare the <span className="font-medium">true price to your door</span>. Here’s how we
          calculate totals and what “membership required” means.
        </p>
      </header>

      <div className="space-y-6 text-sm leading-relaxed text-gray-700">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Item price</h2>
          <p>
            The item price is the price shown by the retailer or marketplace in our authorised data sources (for example,
            affiliate feeds you upload via CSV). Prices can change quickly, so always confirm the final price on the
            retailer’s checkout page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">2) Delivery / postage</h2>
          <p>
            If you enter a postcode, we use it to estimate delivery costs where possible. Some retailers provide exact
            delivery prices in their feeds/APIs; others only provide rules (for example “free delivery over £X”) or vary by
            region.
          </p>
          <div className="rounded-2xl border border-slate-200 p-4 bg-white">
            <div className="font-semibold mb-1">Important</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Delivery can depend on your basket, speed option, promotions, and the retailer’s own terms.
              </li>
              <li>
                When a delivery value is an estimate, we label it as such in the comparison table.
              </li>
            </ul>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">3) Membership required (Prime / Nectar / Clubcard)</h2>
          <p>
            “Membership required” refers to a <span className="font-medium">retailer membership</span> (for example Amazon
            Prime, Nectar, or Tesco Clubcard) that may be needed to access a specific price or delivery benefit.
          </p>
          <p>
            On the Compare page you can tick memberships you already have. We use that to calculate totals (for example,
            Prime may reduce delivery to £0 where the retailer’s rules allow).
          </p>
          <p>
            SavvyDealsHub does <span className="font-medium">not</span> sell or verify retailer memberships.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">4) Total price</h2>
          <p>
            Total price is calculated as:
          </p>
          <div className="rounded-2xl border border-slate-200 p-4 bg-white font-mono text-xs">
            Total = Item price + Delivery / postage − Membership benefits (if you have them)
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold">5) How we rank results</h2>
          <p>
            By default we show the lowest total price first when totals are available. We may also let you sort and filter
            results (for example “no membership required” or “new only”).
          </p>
          <p>
            Some outbound links are affiliate links. Affiliate relationships do not change your price and we aim to keep
            comparisons honest and transparent. See our <a className="underline underline-offset-2" href="/affiliate-disclosure">affiliate disclosure</a> for details.
          </p>
        </section>
      </div>
    </section>
  )
}
