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
          We keep data collection minimal. We use <span className="font-medium">strictly necessary</span> cookies/storage
          to keep the site secure and functioning, and optional cookies only if you consent.
        </p>

        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h2 className="font-semibold mb-2">Cookie categories</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Necessary</span> – required for core site features (security, page
              navigation, load balancing, remembering your cookie choice).
            </li>
            <li>
              <span className="font-medium">Preferences</span> – helps us remember settings you choose (for example your
              Compare page preferences). This is stored in your browser and is not shared with third parties.
            </li>
            <li>
              <span className="font-medium">Analytics</span> – helps us understand what’s popular and improve the site
              (aggregate metrics).
            </li>
            <li>
              <span className="font-medium">Marketing</span> – used for advertising and affiliate measurement when
              enabled.
            </li>
          </ul>
        </div>

        <h2 className="text-lg font-semibold">Local storage (Compare preferences)</h2>
        <p>
          If you tick “Remember my preferences” on the Compare page, we store your search settings (for example postcode
          and membership toggles) in <span className="font-medium">localStorage</span> in your browser so you don’t have
          to re-enter them next time. You can clear this at any time by disabling the checkbox, clearing site data in your
          browser, or using private browsing.
        </p>

        <p>
          We only load non-essential scripts (analytics and advertising) <span className="font-medium">after you’ve
          given consent</span> via the cookie banner. If you choose “Reject non-essential”, analytics/marketing scripts
          won’t load.
        </p>

        <p>
          Your cookie choice is stored in your browser (localStorage and/or a small first‑party cookie) so we can remember
          it on future visits. You can change or withdraw consent at any time using the{' '}
          <span className="font-medium">Cookie settings</span> link in the footer.
        </p>

        <p>
          Some of our partners (for example, advertising networks or stores we link to) may place
          their own cookies when you visit their websites. Those cookies are subject to their own
          privacy and cookie policies.
        </p>

        <p>
          If you have questions about privacy or your data, please contact us via the Contact page.
        </p>
      </div>
    </section>
  )
}
