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

const COOKIE_NAME = 'sdh_cookie_consent'
const COOKIE_MAX_AGE_DAYS = 180

function titleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const cookies = document.cookie ? document.cookie.split(';') : []
  for (const c of cookies) {
    const [k, ...rest] = c.trim().split('=')
    if (k === name) return rest.join('=')
  }
  return null
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

function readStoredConsent(): Consent | null {
  if (typeof window === 'undefined') return null

  // Prefer localStorage, fallback to cookie.
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

function storeConsent(consent: Consent) {
  if (typeof window === 'undefined') return
  const payload = JSON.stringify(consent)
  window.localStorage.setItem(STORAGE_KEY, payload)
  setCookie(COOKIE_NAME, encodeURIComponent(payload))
  window.dispatchEvent(
    new CustomEvent(CONSENT_EVENT, { detail: consent })
  )
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [mode, setMode] = useState<'banner' | 'settings'>('banner')
  const [draft, setDraft] = useState<Consent>({ necessary: true, analytics: false, marketing: false })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const existing = readStoredConsent()
    if (!existing) {
      setVisible(true)
      setMode('banner')
      setDraft({ necessary: true, analytics: false, marketing: false })
    } else {
      setDraft(existing)
    }

    const openHandler = () => {
      const latest = readStoredConsent()
      setDraft(latest ?? { necessary: true, analytics: false, marketing: false })
      setMode('settings')
      setVisible(true)
    }
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
        {mode === 'banner' ? (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1 text-sm leading-relaxed">
                <h2 className="text-base font-semibold mb-1">Cookies on SavvyDealsHub</h2>
                <p className="opacity-90">
                  We use <span className="font-medium">necessary cookies</span> to make the site work.
                  With your permission, we&apos;ll also use{' '}
                  <span className="font-medium">analytics</span> and{' '}
                  <span className="font-medium">marketing</span> cookies to improve SavvyDealsHub and
                  show more relevant deals and ads.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:ml-4 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleChoice({ necessary: true, analytics: false, marketing: false })
                  }}
                  className="inline-flex justify-center rounded-xl border border-slate-500 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-800 transition"
                >
                  Reject non-essential
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('settings')
                    setDraft(readStoredConsent() ?? { necessary: true, analytics: false, marketing: false })
                  }}
                  className="inline-flex justify-center rounded-xl border border-slate-500 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-800 transition"
                >
                  Settings
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
                  Accept all
                </button>
              </div>
            </div>
            <div className="mt-3 text-[11px] sm:text-xs opacity-80">
              You can change your choice at any time using{' '}
              <span className="font-semibold">Cookie settings</span> in the footer. For more information see our{' '}
              <a href="/privacy" className="underline underline-offset-2">
                Privacy &amp; Cookies policy
              </a>
              .
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold mb-1">Cookie settings</h2>
                <p className="text-sm opacity-90">
                  Choose which cookies you allow. Necessary cookies are always enabled.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVisible(false)
                  setMode('banner')
                }}
                className="text-sm underline underline-offset-2 opacity-90 hover:opacity-100"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">Necessary</div>
                    <div className="text-xs opacity-80">Required for core site functionality (always on).</div>
                  </div>
                  <div className="text-xs font-semibold opacity-80">Always active</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">Analytics</div>
                    <div className="text-xs opacity-80">Helps us understand what&apos;s working and improve the site.</div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.analytics}
                      onChange={(e) => setDraft((d) => ({ ...d, analytics: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    {titleCase(draft.analytics ? 'enabled' : 'disabled')}
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">Marketing</div>
                    <div className="text-xs opacity-80">Used for advertising/affiliate measurement and ad personalisation.</div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.marketing}
                      onChange={(e) => setDraft((d) => ({ ...d, marketing: e.target.checked }))}
                      className="h-4 w-4"
                    />
                    {titleCase(draft.marketing ? 'enabled' : 'disabled')}
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDraft({ necessary: true, analytics: false, marketing: false })
                  handleChoice({ necessary: true, analytics: false, marketing: false })
                }}
                className="inline-flex justify-center rounded-xl border border-slate-500 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-800 transition"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={() => handleChoice(draft)}
                className="inline-flex justify-center rounded-xl bg-amber-400 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-amber-300 transition"
              >
                Save preferences
              </button>
            </div>

            <div className="mt-3 text-[11px] sm:text-xs opacity-80">
              More details: <a href="/privacy" className="underline underline-offset-2">Privacy &amp; Cookies policy</a>.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
