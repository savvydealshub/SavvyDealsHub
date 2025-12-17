import Link from 'next/link'
import { site } from '../../lib/config'

export const metadata = {
  title: `Help & FAQ | ${site.name}`,
}

export default function HelpPage() {
  return (
    <div className="container py-10 space-y-6">
      <h1 className="text-2xl font-bold">Help &amp; FAQ</h1>

      <div className="card space-y-3">
        <h2 className="font-semibold">How do I search?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Use the search box on the homepage or the search form on the{' '}
          <Link className="underline" href="/products">Products</Link> page.
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Why are some images generic?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The launch build uses sample products while we connect real affiliate feeds and automation.
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold">Still stuck?</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Visit our <Link className="underline" href="/contact">Contact</Link> page.
        </p>
      </div>
    </div>
  )
}
