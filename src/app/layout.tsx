import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'

import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ConsentScriptLoader from '@/components/ConsentScriptLoader'
import { site } from '@/lib/config'

const title = site.name
const description = `${site.name} — the smartest way to find great deals.`

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    url: site.url,
    siteName: title,
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${site.name} — Smart deals`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
  },
  other: site.adsenseClient
    ? {
        // This generates: <meta name="google-adsense-account" content="ca-pub-..." />
        'google-adsense-account': site.adsenseClient,
      }
    : undefined,
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
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Google AdSense */}
        {site.adsenseClient ? (
          <Script
            id="adsense-js"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}

        {/* Consent + optional scripts */}
        <ConsentScriptLoader />

        <Navbar />
        <main className="container py-6 min-h-[70vh]">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
