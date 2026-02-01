import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for SavvyDealsHub.',
}

export default function TermsPage() {
  return (
    <section className="container max-w-3xl py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-gray-600">Last updated: 31 January 2026</p>
        <p className="text-sm text-gray-600">
          These terms explain how you may use SavvyDealsHub and what you can expect from us.
        </p>
      </header>

      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
          SavvyDealsHub provides product discovery and deal links. We do not sell products directly unless
          explicitly stated.
        </p>

        <h2 className="text-lg font-semibold">Affiliate &amp; advertising</h2>
        <p>
          Some links on SavvyDealsHub are affiliate links. If you click an affiliate link and make a purchase,
          we may earn a commission at no extra cost to you. We may also display advertising.
        </p>

        <h2 className="text-lg font-semibold">Accuracy &amp; availability</h2>
        <p>
          Prices, stock and offers can change quickly. We aim to keep information up to date, but we cannot
          guarantee accuracy at all times. Always verify final pricing and terms on the merchant’s website.
        </p>

        <p>
          If you use our “True Price Comparison” features, delivery costs and totals may be estimates unless the
          retailer provides exact values. See <a className="underline underline-offset-2" href="/how-pricing-works">How pricing works</a> for details.
        </p>

        <h2 className="text-lg font-semibold">External websites</h2>
        <p>
          We link to third-party retailer websites. We do not control those sites and are not responsible for their
          content, policies, checkout experience, or purchases you make on them.
        </p>

        <h2 className="text-lg font-semibold">Intellectual property</h2>
        <p>
          The SavvyDealsHub website design and original content are owned by SavvyDealsHub. Product names, logos, and
          trademarks are the property of their respective owners and are used for identification purposes only.
        </p>

        <h2 className="text-lg font-semibold">Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, SavvyDealsHub is not liable for losses arising from use of the site,
          including reliance on listings, pricing, availability, or third-party services.
        </p>

        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <p>
          You agree not to misuse the site (for example, by attempting to disrupt service, scrape at harmful
          rates, or bypass security features).
        </p>

        <h2 className="text-lg font-semibold">Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the site after changes means you accept the
          updated terms.
        </p>

        <h2 className="text-lg font-semibold">Governing law</h2>
        <p>
          These terms are governed by the laws of England and Wales, and the courts of England and Wales will have
          jurisdiction (unless mandatory local law says otherwise).
        </p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p>
          For questions about these terms, please use the Contact page.
        </p>
      </div>
    </section>
  )
}
