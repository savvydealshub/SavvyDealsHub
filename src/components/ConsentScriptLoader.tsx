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

const COOKIE_NAME = 'sdh_cookie_consent'

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split(';') : []
  for (const c of cookies) {
    const [k, ...rest] = c.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return null
}

function readStoredConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY) || (() => {
    const c = parseCookie(COOKIE_NAME)
    return c ? decodeURIComponent(c) : null
  })()
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

  // If scripts are already loaded and the user later changes consent, update Google Consent Mode if available.
  useEffect(() => {
    if (!consent) return
    const anyWindow = window as any
    if (typeof anyWindow.gtag === 'function') {
      try {
        anyWindow.gtag('consent', 'update', {
          analytics_storage: consent.analytics ? 'granted' : 'denied',
          ad_storage: consent.marketing ? 'granted' : 'denied',
          ad_user_data: consent.marketing ? 'granted' : 'denied',
          ad_personalization: consent.marketing ? 'granted' : 'denied',
        })
      } catch {
        // ignore
      }
    }
  }, [consent])

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
