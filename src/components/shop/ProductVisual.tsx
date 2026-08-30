import { Droplet, Flame, Leaf, Soup, Sparkle, Wheat } from 'lucide-react'
import type { ProductCategory } from '@/data/types'
import { cn } from '@/lib/utils'

const SPICE_ACCENTS = [
  { bg: '#E8A33D', fg: '#3B2606', Icon: Sparkle },
  { bg: '#B24A34', fg: '#FBEEE8', Icon: Flame },
  { bg: '#8A9A5B', fg: '#22270F', Icon: Leaf },
  { bg: '#6B4226', fg: '#F3E9DD', Icon: Soup },
  { bg: '#2B2622', fg: '#EFE7DC', Icon: Sparkle },
]

const OIL_ACCENTS = [
  { bg: '#C9A227', fg: '#2A2103', Icon: Droplet },
  { bg: '#5C6B3C', fg: '#F0F3E6', Icon: Droplet },
  { bg: '#7A5230', fg: '#F4EADB', Icon: Wheat },
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

interface ProductVisualProps {
  id: string
  category: ProductCategory
  className?: string
  iconClassName?: string
}

/** Deterministic, tasteful placeholder imagery — no real product photography backs this catalog yet. */
export function ProductVisual({ id, category, className, iconClassName }: ProductVisualProps) {
  const palette = category === 'cooking-oil' ? OIL_ACCENTS : SPICE_ACCENTS
  const { bg, fg, Icon } = palette[hashString(id) % palette.length]

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: `radial-gradient(circle at 30% 30%, ${fg} 0%, transparent 45%)` }}
      />
      <Icon className={cn('size-8 opacity-90', iconClassName)} style={{ color: fg }} strokeWidth={1.25} />
    </div>
  )
}

const MONOGRAM_ACCENTS = [...SPICE_ACCENTS, ...OIL_ACCENTS]

/** Lightweight thumbnail for contexts without a category (cart/checkout line items) — a monogram tile. */
export function ProductMonogram({ id, name, className }: { id: string; name: string; className?: string }) {
  const { bg, fg } = MONOGRAM_ACCENTS[hashString(id) % MONOGRAM_ACCENTS.length]
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-md font-display text-lg', className)}
      style={{ backgroundColor: bg, color: fg }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
