'use client'

import { FormEvent, useState } from 'react'

export default function ProfilePage() {
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    try {
      alert('Profile save is demo-only in this build. Connect it to your API later.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto card p-6 space-y-5">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Profile & preferences</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            When wired to your backend this page can hold delivery preferences, favourite categories and alert settings.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="displayName" className="font-medium">Display name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="bio" className="font-medium">Short bio / interests</label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark resize-y"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Demo only · values are not persisted yet.</span>
            <button type="submit" className="btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
