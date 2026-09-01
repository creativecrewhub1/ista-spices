import { useState } from 'react'
import { Droplet, Flame, Leaf, Soup, Sparkle, Wheat } from 'lucide-react'
import type { ProductAccent } from '../data/types'
import { cn } from '@/lib/utils'

/*
 * Every product surface on the storefront renders through this component, so
 * photography is a one-line change: pass `src` and it becomes a real photo on
 * the spice-coloured backdrop; leave it off (or let the file 404) and it stays
 * the painted tile. See `src/storefront/data/images.ts`.
 */

const ACCENT_MAP: Record<ProductAccent, { bg: string; fg: string; Icon: typeof Leaf }> = {
  turmeric: { bg: '#E8A33D', fg: '#3B2606', Icon: Sparkle },
  chilli: { bg: '#B24A34', fg: '#FBEEE8', Icon: Flame },
  coriander: { bg: '#8A9A5B', fg: '#22270F', Icon: Leaf },
  'garam-masala': { bg: '#6B4226', fg: '#F3E9DD', Icon: Soup },
  pepper: { bg: '#2B2622', fg: '#EFE7DC', Icon: Sparkle },
  'oil-gold': { bg: '#C9A227', fg: '#2A2103', Icon: Droplet },
  'oil-green': { bg: '#5C6B3C', fg: '#F0F3E6', Icon: Droplet },
  sesame: { bg: '#7A5230', fg: '#F4EADB', Icon: Wheat },
}

/*
 * Seamless-paper backdrops, matching the reference: a packshot sits on ONE flat
 * colour rather than a white cutout. `accent` keeps the per-spice tint for the
 * painted fallback; `backdrop` overrides the surface a photo sits on so a whole
 * row of products can share one studio colour the way a real shoot would.
 */
export type VisualBackdrop = 'accent' | 'teal' | 'clay' | 'sand' | 'ink' | 'cream'

const BACKDROP_MAP: Record<Exclude<VisualBackdrop, 'accent'>, string> = {
  teal: '#1F8A8C',
  clay: '#C2502A',
  sand: '#F2E3CB',
  ink: '#241812',
  cream: '#FBF1E3',
}

interface ProductVisualProps {
  accent: ProductAccent
  /** Photo URL. Falls back to the painted tile when null/undefined or on load error. */
  src?: string | null
  alt?: string
  /** `contain` for packshots on a studio backdrop, `cover` for lifestyle/editorial shots. */
  fit?: 'cover' | 'contain'
  backdrop?: VisualBackdrop
  className?: string
  iconClassName?: string
}

export function ProductVisual({
  accent,
  src,
  alt = '',
  fit = 'cover',
  backdrop = 'accent',
  className,
  iconClassName,
}: ProductVisualProps) {
  const [failed, setFailed] = useState(false)
  const { bg, fg, Icon } = ACCENT_MAP[accent]
  const surface = backdrop === 'accent' ? bg : BACKDROP_MAP[backdrop]
  const showPhoto = Boolean(src) && !failed

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ backgroundColor: surface }}
      aria-hidden={showPhoto ? undefined : 'true'}
    >
      {showPhoto ? (
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={cn('size-full', fit === 'cover' ? 'object-cover' : 'object-contain p-[8%]')}
        />
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: `radial-gradient(circle at 30% 30%, ${fg} 0%, transparent 45%)` }}
          />
          <Icon className={cn('size-10 opacity-90', iconClassName)} style={{ color: fg }} strokeWidth={1.25} />
        </>
      )}
    </div>
  )
}
