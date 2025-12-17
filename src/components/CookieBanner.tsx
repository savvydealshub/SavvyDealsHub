'use client'

import { useEffect, useState } from 'react'

type Consent = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'sdh_cookie_consent'
const CONSENT_EVENT = 'sdh-cookie-consent-changed'
const OPEN_EVENT = 'sdh-cookie-open'

function readStoredConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    }
  } catch {
    return null
  }
}

function storeConsent(consent: Consent) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: consent })
  )
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const existing = readStoredConsent()
    if (!existing) {
      setVisible(true)
    }

    const openHandler = () => setVisible(true)
    window.addEventListener(OPEN_EVENT, openHandler)

    return () => {
      window.removeEventListener(OPEN_EVENT, openHandler)
    }
  }, [])

  const handleChoice = (consent: Consent) => {
    storeConsent(consent)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="max-w-3xl w-full rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1 text-sm leading-relaxed">
            <h2 className="text-base font-semibold mb-1">
              Cookies on SavvyDealsHub
            </h2>
            <p className="opacity-90">
              We use <span className="font-medium">necessary cookies</span> to make
              the site work. With your permission, we&apos;ll also use{' '}
              <span className="font-medium">analytics</span> and{' '}
              <span className="font-medium">marketing</span> cookies to improve
              SavvyDealsHub and show more relevant deals and ads.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-4 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleChoice({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                })
              }
              className="inline-flex justify-center rounded-xl border border-slate-500 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-800 transition"
            >
              Only necessary
            </button>
            <button
              type="button"
              onClick={() =>
                handleChoice({
                  necessary: true,
                  analytics: true,
                  marketing: true,
                })
              }
              className="inline-flex justify-center rounded-xl bg-amber-400 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-amber-300 transition"
            >
              Accept all cookies
            </button>
          </div>
        </div>
        <div className="mt-3 text-[11px] sm:text-xs opacity-80">
          You can change your choice at any time using{' '}
          <button
            type="button"
            onClick={() => {
              // When the banner is already open, this is just informative text.
            }}
            className="underline underline-offset-2"
          >
            Cookie settings
          </button>{' '}
          in the footer. For more information see our{' '}
          <a
            href="/privacy"
            className="underline underline-offset-2"
          >
            Privacy &amp; Cookies policy
          </a>
          .
        </div>
      </div>
    </div>
  )
}
