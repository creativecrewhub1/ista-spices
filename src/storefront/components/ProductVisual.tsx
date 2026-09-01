import { Droplet, Flame, Leaf, Soup, Sparkle, Wheat } from 'lucide-react'
import type { ProductAccent } from '../data/types'
import { cn } from '@/lib/utils'

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

interface ProductVisualProps {
  accent: ProductAccent
  className?: string
  iconClassName?: string
}

export function ProductVisual({ accent, className, iconClassName }: ProductVisualProps) {
  const { bg, fg, Icon } = ACCENT_MAP[accent]

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden', className)}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 30%, ${fg} 0%, transparent 45%)`,
        }}
      />
      <Icon className={cn('size-10 opacity-90', iconClassName)} style={{ color: fg }} strokeWidth={1.25} />
    </div>
  )
}
