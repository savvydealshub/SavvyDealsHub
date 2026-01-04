import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'How SavvyDealsHub earns money through affiliate links and advertising.',
}

export default function AffiliateDisclosurePage() {
  return (
    <section className="container max-w-3xl py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Affiliate Disclosure</h1>
        <p className="text-sm text-gray-600">
          Transparency matters. Here’s how SavvyDealsHub may earn revenue.
        </p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
          SavvyDealsHub may participate in affiliate programs. This means that when you click certain links on
          our site and make a purchase, we may receive a commission.
        </p>

        <p>
          Affiliate revenue helps cover hosting and development costs. It does not increase the price you pay.
        </p>

        <p>
          We aim to rank and present offers based on <span className="font-medium">value and relevance</span> (for
          example, the lowest total price to your door when totals are available). We do not accept payment to hide
          cheaper options.
        </p>

        <p>
          We aim to recommend deals and products based on value and relevance. Merchants can change pricing,
          availability and terms at any time, so please check the final details on the merchant site.
        </p>

        <p>
          If you have questions about our affiliate relationships, contact us via the Contact page.
        </p>
      </div>
    </section>
  )
}
