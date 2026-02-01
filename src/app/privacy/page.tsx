import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookies',
  description: 'Privacy policy and cookie information for SavvyDealsHub.',
}

export default function PrivacyPage() {
  return (
    <section className="container max-w-3xl py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy &amp; Cookies</h1>
        <p className="text-sm text-gray-600">Last updated: 31 January 2026</p>
        <p className="text-sm text-gray-600">
          This policy explains what information SavvyDealsHub collects, how it’s used, and how cookies and affiliate
          tracking work.
        </p>
      </header>

      <div className="space-y-5 text-sm leading-relaxed text-gray-700">
        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h2 className="font-semibold mb-2">Quick summary</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>We keep data collection minimal and only use non-essential cookies if you consent.</li>
            <li>We may earn commissions from affiliate links (including Amazon and eBay) at no extra cost to you.</li>
            <li>Affiliate partners may use cookies/identifiers to attribute qualifying purchases.</li>
          </ul>
        </div>

        <h2 className="text-lg font-semibold">1) Who we are</h2>
        <p>
          “SavvyDealsHub” (“we”, “us”, “our”) operates this website. For privacy questions, contact{' '}
          <a className="underline underline-offset-2" href="mailto:support@savvydealshub.com">
            support@savvydealshub.com
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold">2) Information we collect</h2>
        <p>We may collect and process the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium">Information you provide</span> (for example, if you email us): your email
            address and the content of your message.
          </li>
          <li>
            <span className="font-medium">Information collected automatically</span> when you visit the site: device and
            browser information, pages viewed, and basic usage events. Our hosting and security providers may process IP
            addresses for security and abuse prevention. We do not use IP addresses to identify you.
          </li>
          <li>
            <span className="font-medium">Affiliate/referral information</span>: when you click an affiliate link, the
            retailer/affiliate network may collect click and attribution information to credit qualifying purchases.
          </li>
          <li>
            <span className="font-medium">Outbound click events</span>: when you click “View Deal”, we may log a
            privacy-safe click event (for example: the offer id, retailer, category, and the page you came from). We
            don’t store full IP addresses in this click log.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">3) How we use information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>To operate, secure, and maintain the site.</li>
          <li>To understand what content is useful and improve performance and user experience.</li>
          <li>To respond to support and partnership enquiries.</li>
          <li>To measure affiliate link performance and attribute commissions where applicable.</li>
        </ul>

        <h2 className="text-lg font-semibold">4) Cookies &amp; local storage</h2>
        <p>
          We use cookies and similar technologies. We also use <span className="font-medium">localStorage</span> for
          certain features (for example, Compare page preferences if you choose “Remember my preferences”). You can clear
          this any time via your browser settings.
        </p>

        <div className="rounded-2xl border border-slate-200 p-4 bg-white">
          <h3 className="font-semibold mb-2">Cookie categories</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-medium">Necessary</span> – required for core site features (security, page
              navigation, remembering your cookie choice).
            </li>
            <li>
              <span className="font-medium">Preferences</span> – remembers settings you choose (stored locally in your
              browser).
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

        <p>
          We only load non-essential scripts (analytics/marketing) <span className="font-medium">after you consent</span>
          via the cookie banner. You can change or withdraw consent using the <span className="font-medium">Cookie settings</span>{' '}
          link in the footer.
        </p>

        <h2 className="text-lg font-semibold">5) Amazon Associates &amp; affiliate links</h2>
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
          <span className="font-medium">Amazon disclosure:</span> As an Amazon Associate I earn from qualifying purchases.
        </div>
        <p>
          When you click an affiliate link and buy something, we may earn a commission at no extra cost to you. Affiliate
          partners (including Amazon, the eBay Partner Network, and other retailers/networks we work with) may use
          cookies or similar technologies on their sites to track referrals and attribute qualifying purchases.
        </p>

        <h2 className="text-lg font-semibold">6) Lawful bases (UK/EU)</h2>
        <p>
          Where UK/EU privacy laws apply, we process personal data on one or more of these lawful bases: (a) <span className="font-medium">consent</span>
          (for non-essential cookies/scripts), (b) <span className="font-medium">legitimate interests</span> (to run and
          secure the site and measure general performance), and (c) <span className="font-medium">contract/steps to enter a contract</span>
          where applicable (for example, responding to a request you make).
        </p>

        <h2 className="text-lg font-semibold">7) Sharing and third parties</h2>
        <p>
          We may share limited information with service providers that help us run the site (for example, hosting,
          analytics, advertising/affiliate measurement, and security). Third-party sites you visit from our links have
          their own policies.
        </p>

        <h2 className="text-lg font-semibold">8) Data retention</h2>
        <p>
          We keep personal data only as long as needed for the purposes above. For example, support emails are retained as
          long as necessary to handle your request, and analytics data (if enabled) is retained according to our provider
          settings.
        </p>

        <h2 className="text-lg font-semibold">9) Your choices and rights</h2>
        <p>
          You can control cookies in your browser settings and via our cookie controls. If you want to request access,
          correction, or deletion of data you’ve provided (for example, emails you’ve sent us), contact{' '}
          <a className="underline underline-offset-2" href="mailto:support@savvydealshub.com">
            support@savvydealshub.com
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold">10) International transfers</h2>
        <p>
          Some of our service providers may process data outside the UK. Where we transfer personal data internationally,
          we rely on appropriate safeguards (for example, adequacy decisions or standard contractual clauses) where
          required.
        </p>

        <h2 className="text-lg font-semibold">11) Security</h2>
        <p>
          We use reasonable technical and organisational measures to protect information. No method of transmission or
          storage is 100% secure, so we can’t guarantee absolute security.
        </p>

        <h2 className="text-lg font-semibold">12) Children</h2>
        <p>
          SavvyDealsHub is not directed to children and we do not knowingly collect personal data from children.
        </p>

        <h2 className="text-lg font-semibold">13) Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we do, we’ll update the “Last updated” date at the top of
          this page.
        </p>
      </div>
    </section>
  )
}
