'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      alert('Registration is running in demo front-end mode only. Connect to your real user DB next.')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto card p-6 space-y-5">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This form is wired for UX only. Hook it up to your auth backend when ready.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label htmlFor="name" className="font-medium">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
              placeholder="Jane Doe"
            />
          </div>

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
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              minLength={6}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sdh-primary/70
                         dark:bg-sdh-bg-dark dark:border-slate-700 dark:text-sdh-text-dark"
              placeholder="At least 6 characters"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-2">
                Login
              </Link>
            </span>
          </div>

          <button
            type="submit"
            className="btn w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}
