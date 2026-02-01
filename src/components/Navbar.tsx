'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuWrapRef = useRef<HTMLDivElement | null>(null)

  // Close on outside click + Escape
  useEffect(() => {
    if (!menuOpen) return

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (!menuWrapRef.current) return
      if (!menuWrapRef.current.contains(target)) setMenuOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-sdh-bg/90 backdrop-blur dark:border-slate-800 dark:bg-sdh-bg-dark/90">
      <div className="container flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <Image
            src="/sdh-logo.png"
            alt="SavvyDealsHub logo"
            width={180}
            height={72}
            className="h-12 w-auto md:h-14"
            priority
          />
        </Link>

        {/* Menu */}
        <div className="relative" ref={menuWrapRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="px-5 py-2 rounded-full bg-white/80 text-sdh-primary text-sm md:text-base font-semibold shadow-soft border border-slate-200/80 hover:bg-white dark:bg-sdh-surface-dark/90 dark:text-sdh-text-dark dark:border-slate-700/80 dark:hover:bg-sdh-surface-dark"
          >
            Menu
          </button>

          {menuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-52 rounded-2xl bg-sdh-surface shadow-soft border border-slate-200/80 dark:bg-sdh-surface-dark dark:border-slate-700/80 overflow-hidden">
              <nav className="py-1" role="menu" aria-label="Main menu">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Login
                </Link>
                <Link
                  href="/products"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Products
                </Link>
                <Link
                  href="/c"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Categories
                </Link>
                <Link
                  href="/retailers"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Retailers
                </Link>
                <Link
                  href="/compare"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Compare (True Price)
                </Link>
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Contact
                </Link>
                <Link
                  href="/help"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-sm hover:bg-sdh-bg dark:hover:bg-sdh-bg-dark/70"
                  role="menuitem"
                >
                  Help &amp; FAQ
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Theme */}
        <ThemeToggle />
      </div>
    </header>
  )
}
