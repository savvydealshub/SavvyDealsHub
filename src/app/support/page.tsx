'use client'

import { FormEvent, useState } from 'react'

export default function SupportPage() {
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    try {
      alert('Support form is demo-only right now. Connect this to your helpdesk or inbox when ready.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-xl mx-auto card p-6 space-y-5">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Help & support</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Let users reach you for billing, deal questions or feedback. This layout is ready to plug into email or a ticketing system.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="topic" className="font-medium">Topic</label>
            <input
              id="topic"
              name="topic"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="message" className="font-medium">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark resize-y"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Demo only · not sending anywhere yet.</span>
            <button type="submit" className="btn" disabled={sending}>
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
