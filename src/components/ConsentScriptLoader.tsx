'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

type Consent = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'sdh_cookie_consent'
const CONSENT_EVENT = 'sdh-cookie-consent-changed'

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

export default function ConsentScriptLoader() {
  const [consent, setConsent] = useState<Consent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateFromStorage = () => {
      const existing = readStoredConsent()
      setConsent(existing)
    }

    updateFromStorage()

    const consentHandler = () => updateFromStorage()
    window.addEventListener(CONSENT_EVENT, consentHandler)

    const storageHandler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        updateFromStorage()
      }
    }
    window.addEventListener('storage', storageHandler)

    return () => {
      window.removeEventListener(CONSENT_EVENT, consentHandler)
      window.removeEventListener('storage', storageHandler)
    }
  }, [])

  if (!consent) {
    // No explicit choice yet, so we avoid loading non-essential scripts.
    return null
  }

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <>
      {/* Google Analytics 4 (optional, analytics cookies) */}
      {gaMeasurementId && consent.analytics && (
        <>
          <Script
            id="sdh-ga4"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          />
          <Script
            id="sdh-ga4-inline"
            strategy="afterInteractive"
          >{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}', { anonymize_ip: true });
          `}</Script>
        </>
      )}

      {/* Google AdSense (optional, marketing cookies) */}
      {adsenseClient && consent.marketing && (
        <Script
          id="sdh-adsense"
          strategy="afterInteractive"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      )}
    </>
  )
}
