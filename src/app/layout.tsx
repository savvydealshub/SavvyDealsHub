import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { config } from '@/lib/config'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ConsentScriptLoader from '@/components/ConsentScriptLoader'

export const metadata: Metadata = {
  title: 'Smart deals & true-price comparison | SavvyDealsHub',
  description:
    'Compare real delivered prices (including delivery and retailer memberships like Prime/Nectar/Clubcard) and find the smartest deals with SavvyDealsHub.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Allow rich previews
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: config.public.siteUrl,
  },
  openGraph: {
    title: 'Smart deals & true-price comparison | SavvyDealsHub',
    description: 'Compare real delivered prices and find the smartest deals with SavvyDealsHub.',
    url: config.public.siteUrl,
    siteName: 'SavvyDealsHub',
    images: [
      {
        url: `${config.public.siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'SavvyDealsHub — Smart deals',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart deals & true-price comparison | SavvyDealsHub',
    description: 'Compare real delivered prices and find the smartest deals with SavvyDealsHub.',
    images: [`${config.public.siteUrl}/opengraph-image`],
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
  },
  other: config.public.adsenseClient
    ? {
        'google-adsense-account': config.public.adsenseClient,
      }
    : undefined,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Google AdSense */}
        {config.public.adsenseClient ? (
          <Script
            id="adsense-js"
            async
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${config.public.adsenseClient}`}
            crossOrigin="anonymous"
          />
        ) : null}

        {/* Consent + optional scripts */}
        <ConsentScriptLoader />
        <Navbar />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
