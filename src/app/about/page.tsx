import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About SavvyDealsHub',
}

export default function AboutPage() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">About SavvyDealsHub</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          SavvyDealsHub is designed as an enterprise-ready deal discovery platform. 
          This build gives you a fully themed home experience, hexagonal navigation, 
          cookie consent banner and live-ready layout components that you can connect 
          to your own affiliate feeds, authentication and reporting stack.
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Out of the box, the system uses Prisma with SQLite for categories and products, 
          and provides API routes for ingestion, reporting and future automation. 
          You can keep everything local on a single machine for testing, or move to 
          a production database and hosting when you&apos;re ready.
        </p>
      </div>
    </div>
  )
}
