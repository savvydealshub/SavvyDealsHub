'use client'

import { useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'sdh-theme'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
  if (stored === 'light' || stored === 'dark') return stored

  // Fallback to system preference the first time
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  root.classList.remove('light', 'dark')
  root.classList.add(mode)

  if (mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  root.dataset.theme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('light')

  useEffect(() => {
    const initial = getInitialMode()
    setMode(initial)
    applyTheme(initial)
  }, [])

  useEffect(() => {
    applyTheme(mode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, mode)
    }
  }, [mode])

  const modes: { id: ThemeMode; label: string }[] = [
    { id: 'dark', label: 'Dark' },
    { id: 'light', label: 'Light' },
  ]

  const base =
    'px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full transition select-none'
  const active = 'bg-sdh-primary text-white shadow-soft'
  const inactive =
    'bg-transparent text-sdh-muted hover:bg-sdh-bg/70 dark:hover:bg-sdh-bg-dark/70'

  return (
    <div className="flex items-center gap-2 bg-sdh-surface/70 rounded-pill p-1 shadow-soft border border-slate-200/70 dark:border-slate-700/80">
      {modes.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => setMode(id)}
          className={`${base} ${mode === id ? active : inactive}`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
