'use client'

import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  initialQ?: string
  initialPostcode?: string
  initialPrime?: boolean
  initialNectar?: boolean
  initialClubcard?: boolean
}

type Prefs = {
  q: string
  postcode: string
  prime: boolean
  nectar: boolean
  clubcard: boolean
  remember: boolean
}

const STORAGE_KEY = 'sdh_compare_prefs_v1'

function safeLoadPrefs(): Partial<Prefs> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<Prefs>
    return data && typeof data === 'object' ? data : null
  } catch {
    return null
  }
}

function safeSavePrefs(prefs: Prefs) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // ignore (storage disabled)
  }
}

function normalizePostcode(pc: string): string {
  return pc.trim().toUpperCase()
}

export default function CompareSearchForm({
  initialQ = '',
  initialPostcode = '',
  initialPrime = false,
  initialNectar = false,
  initialClubcard = false,
}: Props) {
  const router = useRouter()

  const [prefs, setPrefs] = useState<Prefs>(() => ({
    q: initialQ,
    postcode: initialPostcode,
    prime: initialPrime,
    nectar: initialNectar,
    clubcard: initialClubcard,
    remember: true,
  }))

  // If the server didn't provide values (first visit), try to preload saved prefs.
  useEffect(() => {
    const hasAnyInitial = Boolean(
      (initialQ ?? '').trim() || (initialPostcode ?? '').trim() || initialPrime || initialNectar || initialClubcard
    )
    if (hasAnyInitial) return

    const saved = safeLoadPrefs()
    if (!saved) return

    setPrefs((p) => ({
      ...p,
      q: typeof saved.q === 'string' ? saved.q : p.q,
      postcode: typeof saved.postcode === 'string' ? saved.postcode : p.postcode,
      prime: typeof saved.prime === 'boolean' ? saved.prime : p.prime,
      nectar: typeof saved.nectar === 'boolean' ? saved.nectar : p.nectar,
      clubcard: typeof saved.clubcard === 'boolean' ? saved.clubcard : p.clubcard,
      remember: typeof saved.remember === 'boolean' ? saved.remember : p.remember,
    }))
  }, [initialQ, initialPostcode, initialPrime, initialNectar, initialClubcard])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    const q = prefs.q.trim()
    const postcode = normalizePostcode(prefs.postcode)
    if (q) params.set('q', q)
    if (postcode) params.set('postcode', postcode)
    if (prefs.prime) params.set('prime', '1')
    if (prefs.nectar) params.set('nectar', '1')
    if (prefs.clubcard) params.set('clubcard', '1')
    const qs = params.toString()
    return qs ? `?${qs}` : ''
  }, [prefs])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Prefs = {
      ...prefs,
      postcode: normalizePostcode(prefs.postcode),
    }
    if (next.remember) safeSavePrefs(next)
    router.push(`/compare${queryString}`)
  }

  return (
    <form className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end" onSubmit={onSubmit}>
      <label className="md:col-span-6">
        <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">Search product</div>
        <input
          value={prefs.q}
          onChange={(e) => setPrefs((p) => ({ ...p, q: e.target.value }))}
          placeholder="e.g. Dyson vacuum, iPhone 14, DeWalt drill..."
          className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
        />
      </label>

      <label className="md:col-span-3">
        <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">Postcode</div>
        <input
          value={prefs.postcode}
          onChange={(e) => setPrefs((p) => ({ ...p, postcode: e.target.value }))}
          placeholder="e.g. WA4 2XX"
          className="w-full h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-sdh-primary/60 dark:border-slate-700 dark:bg-sdh-bg-dark"
        />
      </label>

      <div className="md:col-span-3 flex gap-3">
        <button type="submit" className="h-11 w-full rounded-xl bg-sdh-primary text-white text-sm font-semibold hover:opacity-90">
          Compare
        </button>
      </div>

      <div className="md:col-span-12 flex flex-wrap gap-4 text-sm pt-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.prime}
            onChange={(e) => setPrefs((p) => ({ ...p, prime: e.target.checked }))}
          />
          I have Amazon Prime
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.nectar}
            onChange={(e) => setPrefs((p) => ({ ...p, nectar: e.target.checked }))}
          />
          I have Nectar
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.clubcard}
            onChange={(e) => setPrefs((p) => ({ ...p, clubcard: e.target.checked }))}
          />
          I have Clubcard
        </label>

        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={prefs.remember}
            onChange={(e) => setPrefs((p) => ({ ...p, remember: e.target.checked }))}
          />
          Remember my preferences
        </label>
      </div>
    </form>
  )
}
