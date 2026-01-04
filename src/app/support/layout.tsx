import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Support',
  robots: { index: false, follow: true },
}

export default function SupportLayout({ children }: { children: ReactNode }) {
  return children
}
