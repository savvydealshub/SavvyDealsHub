'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    try {
      // Demo: ask backend to set a guest session cookie
      await fetch('/api/auth/session', { method: 'GET' })
      alert('Logged in (demo mode). Wire this up to real auth when ready.')
      router.push('/')
    } catch (err) {
      console.error(err)
      alert('Login failed (demo). Check console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto card p-6 space-y-5">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Login to SavvyDealsHub</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Access your saved deals, preferences and future dashboards.
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
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              New here?{' '}
              <Link href="/register" className="underline underline-offset-2">
                Create an account
              </Link>
            </span>
          </div>

          <button
            type="submit"
            className="btn w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
