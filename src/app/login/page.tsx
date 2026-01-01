import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="container py-10">
      <div className="max-w-md mx-auto card p-6 space-y-5">
        <header className="space-y-1">
          <h1 className="text-xl font-bold">Login</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Account login is temporarily unavailable while we complete launch setup.
          </p>
        </header>

        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            You can still browse deals, compare prices, and click through to retailers.
          </p>
          <p>
            Member features will return shortly.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <Link href="/" className="underline underline-offset-2">
            Back to home
          </Link>

          <Link href="/help" className="underline underline-offset-2">
            Help &amp; FAQ
          </Link>
        </div>
      </div>
    </main>
  )
}