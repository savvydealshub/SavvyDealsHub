'use client'

export default function Footer() {
  const openCookieSettings = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event('sdh-cookie-open'))
  }

  const year = new Date().getFullYear()

  return (
    <footer className="border-t mt-10">
      <div className="container py-8 text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div>
          © {year} SavvyDealsHub — Affiliate links may earn us a commission.
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <button
            type="button"
            onClick={openCookieSettings}
            className="underline underline-offset-2 hover:text-gray-900"
          >
            Cookie settings
          </button>
          <a href="/how-pricing-works" className="underline underline-offset-2 hover:text-gray-900">
            How pricing works
          </a>
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-gray-900"
          >
            Privacy &amp; Cookies
          </a>
          <a
            href="/terms"
            className="underline underline-offset-2 hover:text-gray-900"
          >
            Terms
          </a>
          <a
            href="/affiliate-disclosure"
            className="underline underline-offset-2 hover:text-gray-900"
          >
            Affiliate disclosure
          </a>
          <a href="/contact" className="underline underline-offset-2 hover:text-gray-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}
