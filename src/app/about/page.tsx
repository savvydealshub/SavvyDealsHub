import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About SavvyDealsHub',
  description: 'Learn what SavvyDealsHub is, how it works, and how we’re funded.',
}

export default function AboutPage() {
  return (
    <section className="container max-w-3xl py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">About SavvyDealsHub</h1>
        <p className="text-sm text-gray-600">
          SavvyDealsHub is a UK-focused deal discovery website that helps shoppers find useful products and offers across
          trusted retailers.
        </p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <h2 className="text-lg font-semibold">What we do</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Curate deals and product recommendations to make shopping quicker and simpler.</li>
          <li>Organise products by category so you can browse without wading through endless pages.</li>
          <li>Link you directly to retailer pages so you can check the latest price and availability.</li>
        </ul>

        <h2 className="text-lg font-semibold">How we’re funded</h2>
        <p>
          Some links on SavvyDealsHub are affiliate links. If you click a link and make a purchase, we may earn a
          commission at no extra cost to you.
        </p>

        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h3 className="font-semibold mb-2">Example partners (may vary)</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Amazon Associates</li>
            <li>eBay Partner Network (EPN)</li>
            <li>Other retailer partner programs and affiliate networks</li>
          </ul>
        </div>
        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <span className="font-medium">Amazon disclosure:</span> As an Amazon Associate I earn from qualifying
          purchases.
        </p>

        <h2 className="text-lg font-semibold">Our goal</h2>
        <p>
          Build a simple, reliable place to discover deals without spam — and keep the site sustainable through
          transparent affiliate revenue.
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          Partnership enquiries or support: <a className="underline underline-offset-2" href="mailto:support@savvydealshub.com">support@savvydealshub.com</a>
        </p>
      </div>
    </section>
  )
}
