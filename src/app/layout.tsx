import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CookieBanner from '../components/CookieBanner'
import ConsentScriptLoader from '../components/ConsentScriptLoader'
import { site } from '../lib/config'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const title = site.name
const description = `${site.name} — the smartest way to find great deals.`

export const metadata: Metadata = {
  other: { 'google-adsense-account': 'ca-pub-3051610197061559' },
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: title,
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConsentScriptLoader />
        <Navbar />
        <main className="container py-6">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
