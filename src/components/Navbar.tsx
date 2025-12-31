'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-sdh-bg/90 backdrop-blur dark:border-slate-800 dark:bg-sdh-bg-dark/90">
      <div className="container flex items-center justify-between h-20">
        {/* Logo left */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex items-center">
            <Image
              src="/sdh-logo.png"
              alt="SavvyDealsHub logo"
              width={180}
              height={72}
              className="h-12 w-auto md:h-14"
              priority
            />
          </div>
        </Link>

        {/* Center menu button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="px-5 py-2 rounded-full bg-white/80 text-sdh-primary text-sm md:text-base font-semibold shadow-soft border border-slate-200/80 hover:bg-white dark:bg-sdh-surface-dark/90 dark:text-sdh-text-dark dark:border-slate-700/80 dark:hover:bg-sdh-surface-dark"
          >
            Menu
          </button>

          {menuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-52 rounded-2xl bg-sdh-surface shadow-soft border border-slate-200/80 dark:bg-sdh-surface-dark dark:border-slate-700/80 overflow-hidden">
              <div className="py-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-sm text-sdh-text hover:bg-sdh-bg dark:text-sdh-text-dark dark:hover:bg-sdh-bg-dark/70"
                >
                 <Link href="/login">Login</Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-sm text-sdh-text hover:bg-sdh-bg dark:text-sdh-text-dark dark:hover:bg-sdh-bg-dark/70"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-sm text-sdh-text hover:bg-sdh-bg dark:text-sdh-text-dark dark:hover:bg-sdh-bg-dark/70"
                >
                  Contact
                </Link>
                <Link
                  href="/help"
                  className="block px-4 py-2 text-sm text-sdh-text hover:bg-sdh-bg dark:text-sdh-text-dark dark:hover:bg-sdh-bg-dark/70"
                >
                  Help &amp; FAQ
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle right */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
