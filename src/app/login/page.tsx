import Link from 'next/link'

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-2xl font-semibold">Login</h1>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Account login is temporarily unavailable while we complete launch setup.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          Back to home
        </Link>

        <Link
          href="/help"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Help
        </Link>
      </div>
    </main>
  )
}
