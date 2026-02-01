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
        <p className="text-sm text-gray-600">Last updated: 31 January 2026</p>
        <p className="text-sm text-gray-600">
          Transparency matters. Here’s how SavvyDealsHub may earn revenue.
        </p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
          SavvyDealsHub may participate in affiliate programs. This means that when you click certain links on our site
          and make a purchase, we may receive a commission <span className="font-medium">at no extra cost to you</span>.
        </p>

        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h2 className="font-semibold mb-2">Affiliate programs we may use</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Amazon Services LLC Associates Program (Amazon Associates)</li>
            <li>eBay Partner Network (EPN)</li>
            <li>Other affiliate networks and merchant partner programs (where available and permitted)</li>
          </ul>
        </div>

        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <span className="font-medium">Amazon disclosure:</span> As an Amazon Associate we earn from qualifying purchases.
        </p>

        <p>Affiliate revenue helps cover hosting and development costs and keeps the site running.</p>

        <p>
          Affiliate partners may use cookies or similar technologies to record referrals and attribute qualifying purchases. Any
          purchase you make is between you and the merchant, and those third parties process data under their own privacy policies.
        </p>

        <p>
          Wherever practical, outbound product links are marked as <span className="font-medium">sponsored</span> and
          use <span className="font-medium">nofollow</span> to keep our disclosures clear.
        </p>

        <h2 className="text-lg font-semibold">Sponsored / paid placements</h2>
        <p>
          From time to time, some listings may be sponsored or paid placements. Where this applies, we aim to clearly
          label the content.
        </p>

        <p>
          We aim to rank and present offers based on <span className="font-medium">value and relevance</span> (for
          example, the lowest total price to your door when totals are available). We do not accept payment to hide
          cheaper options.
        </p>

        <p>
          Merchants can change pricing, availability and terms at any time, so please check the final details on the
          merchant site before purchasing.
        </p>

        <p>
          If you have questions about our affiliate relationships, contact us via the Contact page.
        </p>
      </div>
    </section>
  )
}
