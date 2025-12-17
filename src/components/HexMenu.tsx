'use client'

import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  FaBolt,
  FaTshirt,
  FaCouch,
  FaMobileAlt,
  FaCarSide,
  FaBaby,
  FaHeart,
  FaPaw,
  FaShoppingCart,
  FaBriefcase,
  FaTools,
} from 'react-icons/fa'

type IconType = ComponentType<{ className?: string }>

type HomeCategory = {
  slug: string
  label: string
  color: string
  Icon: IconType
}

const HOME_CATEGORIES: HomeCategory[] = [
  { slug: 'todays-deals', label: "Today’s Deals", color: '#ff6a1a', Icon: FaBolt },
  { slug: 'clothing', label: 'Clothing', color: '#ffb020', Icon: FaTshirt },
  { slug: 'home-kitchen', label: 'Home & Kitchen', color: '#34b34a', Icon: FaCouch },
  { slug: 'sports', label: 'Sports', color: '#008fbd', Icon: FaMobileAlt },
  { slug: 'automotive', label: 'Automotive', color: '#00a3a3', Icon: FaCarSide },
  { slug: 'toys-baby', label: 'Toys & Baby', color: '#ff6a55', Icon: FaBaby },
  { slug: 'health-beauty', label: 'Health & Beauty', color: '#ff4b5c', Icon: FaHeart },
  { slug: 'pet-supplies', label: 'Pet Supplies', color: '#34b34a', Icon: FaPaw },
  { slug: 'grocery', label: 'Grocery', color: '#ff6a1a', Icon: FaShoppingCart },
  { slug: 'office-supplies', label: 'Office Supplies', color: '#008fbd', Icon: FaBriefcase },
  { slug: 'tools-hardware', label: 'Tools & Hardware', color: '#2563eb', Icon: FaTools },
]

// Softer, slightly rounded hexagon shape
const HEX_CLIP = 'polygon(22% 4%, 78% 4%, 96% 26%, 96% 74%, 78% 96%, 22% 96%, 4% 74%, 4% 26%)'

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, value))
}

function adjustColor(base: string, amount: number): string {
  if (!base.startsWith('#') || (base.length !== 7 && base.length !== 4)) return base

  let hex = base.slice(1)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((ch) => ch + ch)
      .join('')
  }

  const num = parseInt(hex, 16)
  if (Number.isNaN(num)) return base

  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0xff) + amount
  let b = (num & 0xff) + amount

  r = clampChannel(r)
  g = clampChannel(g)
  b = clampChannel(b)

  const next = (r << 16) | (g << 8) | b
  return '#' + next.toString(16).padStart(6, '0')
}

function lighten(color: string, amount: number): string {
  return adjustColor(color, amount)
}

function darken(color: string, amount: number): string {
  return adjustColor(color, -amount)
}

function CategoryHex({ slug, label, color, Icon }: HomeCategory) {
  const highlight = lighten(color, 80)
  const mid = lighten(color, 30)
  const shadow = darken(color, 70)

  const gradient = `linear-gradient(180deg, ${highlight} 0%, ${mid} 35%, ${color} 70%, ${shadow} 100%)`

  return (
    <Link href={`/c/${slug}`} className="flex flex-col items-center gap-2">
      <div
        className="w-24 h-[104px] md:w-28 md:h-[120px] flex items-center justify-center transition-transform duration-150 hover:-translate-y-[2px] active:translate-y-[1px]"
        style={{
          clipPath: HEX_CLIP,
          borderRadius: '28px',
          filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.55))',
        }}
      >
        <div
          className="w-full h-full flex items-center justify-center relative"
          style={{
            clipPath: HEX_CLIP,
            borderRadius: '26px',
            backgroundImage: gradient,
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow:
              'inset 0 2px 0 rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.35)',
          }}
        >
          {/* glossy highlight */}
          <div
            className="absolute inset-x-[12%] top-[10%] h-[45%] rounded-full opacity-80"
            style={{
              background:
                'radial-gradient(circle at top, rgba(255,255,255,0.98), rgba(255,255,255,0.14) 70%, transparent 100%)',
              mixBlendMode: 'screen',
            }}
          />
          <Icon className="relative w-9 h-9 md:w-10 md:h-10 text-white drop-shadow-md" />
        </div>
      </div>
      <span className="text-[13px] md:text-[14px] font-semibold text-sdh-primary dark:text-sdh-text-dark text-center leading-tight">
        {label}
      </span>
    </Link>
  )
}

export default function HexMenu() {
  return (
    <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 md:gap-x-10 md:gap-y-8">
      {HOME_CATEGORIES.map((cat) => (
        <CategoryHex key={cat.slug} {...cat} />
      ))}
    </div>
  )
}
