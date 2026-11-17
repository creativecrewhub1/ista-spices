import { cn } from '@/lib/utils'

// Heap-of-powder / pool-of-oil colors, roughly true to the actual spice —
// used to colour the monogram tile that stands in for a product photo.
const SPICE_MOUNDS = [
  { light: '#f8d35a', mid: '#dba315', dark: '#9c6f0a' }, // turmeric
  { light: '#e6704a', mid: '#c23616', dark: '#7a2210' }, // kashmiri chilli
  { light: '#b8483a', mid: '#8f2418', dark: '#54140c' }, // guntur chilli
  { light: '#bcab68', mid: '#948748', dark: '#5c5227' }, // coriander
  { light: '#b17f42', mid: '#8b5a2b', dark: '#4f3015' }, // garam masala
  { light: '#5c4d43', mid: '#332920', dark: '#1b1510' }, // black pepper
]

const OIL_MOUNDS = [
  { light: '#f9e08f', mid: '#e0a82e', dark: '#8f6212' }, // groundnut oil
  { light: '#fdfbf0', mid: '#f0e6c4', dark: '#d8c68a' }, // coconut oil
  { light: '#d6ac67', mid: '#a5672a', dark: '#623c15' }, // sesame oil
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return hash
}

const MONOGRAM_MOUNDS = [...SPICE_MOUNDS, ...OIL_MOUNDS]

/** Lightweight thumbnail for contexts without a category (cart/checkout line items) — a monogram tile. */
export function ProductMonogram({ id, name, className }: { id: string; name: string; className?: string }) {
  const { mid, dark } = MONOGRAM_MOUNDS[hashString(id) % MONOGRAM_MOUNDS.length]
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-2xl font-display text-lg text-white', className)}
      style={{ background: `radial-gradient(circle at 35% 30%, ${mid}, ${dark})` }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}
