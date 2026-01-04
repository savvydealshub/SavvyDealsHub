import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Register',
  robots: { index: false, follow: true },
}

export default function RegisterPage() {
  // Registration disabled for launch
  redirect('/login')
}
