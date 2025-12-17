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

      <div className="space-y-3 text-sm leading-relaxed text-gray-700">
        <p>
          We use <span className="font-medium">strictly necessary cookies</span> to keep the site
          secure and functioning. For example, these cookies may remember your session, your basket
          and basic preferences. These cookies are always on and do not require consent.
        </p>

        <p>
          With your permission, we also use <span className="font-medium">analytics cookies</span> to
          understand how people use SavvyDealsHub (for example, which pages are most popular) and{' '}
          <span className="font-medium">marketing cookies</span> to support advertising and affiliate
          links. These cookies help us earn revenue and keep the service running, but they are
          optional and only set when you choose &quot;Accept all cookies&quot; in the cookie banner.
        </p>

        <p>
          Your cookie choice is stored using a small piece of data in your browser so we can remember
          it on future visits. You can change this choice at any time by using the{' '}
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
