import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy & Cookies',
}

export default function PrivacyPage() {
  return (
    <section className="container max-w-3xl py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy &amp; Cookies</h1>
        <p className="text-sm text-gray-600">
          This page explains how SavvyDealsHub uses cookies and similar technologies on this website.
        </p>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-gray-700">
        <p>
          We use <span className="font-medium">strictly necessary cookies</span> to keep the site secure
          and functioning. These are always on and do not require consent.
        </p>

        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h2 className="font-semibold mb-2">Cookie categories</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Necessary</span> – required for core site features (security, page
              navigation, load balancing, remembering your cookie choice).
            </li>
            <li>
              <span className="font-medium">Analytics</span> – helps us understand what’s popular and improve the
              site (for example, aggregate visitor metrics).
            </li>
            <li>
              <span className="font-medium">Marketing</span> – used for advertising/affiliate measurement and ad
              personalisation.
            </li>
          </ul>
        </div>

        <p>
          We only load non-essential scripts (analytics and advertising) <span className="font-medium">after you’ve
          given consent</span> via the cookie banner. If you choose “Reject non-essential”, analytics/marketing
          scripts won’t load.
        </p>

        <p>
          Your choice is stored in your browser (localStorage and a small first‑party cookie) so we can remember it
          on future visits. You can change or withdraw consent at any time using the{' '}
          <span className="font-medium">Cookie settings</span> link in the footer.
        </p>

        <p>
          Some of our partners (for example, advertising networks or stores we link to) may place
          their own cookies when you visit their websites. Those cookies are subject to their own
          privacy and cookie policies.
        </p>

        <p>
          If you have any questions about how we use cookies or your data, please contact us using the
          details provided on the site.
        </p>
      </div>
    </section>
  )
}
