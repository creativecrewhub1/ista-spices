import { cn } from '@/lib/utils'

function formatINR(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    value,
  )
}

interface PriceTagProps {
  price: number
  compareAtPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceTag({ price, compareAtPrice, size = 'md', className }: PriceTagProps) {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
  }[size]

  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn('font-medium tabular-nums text-foreground', sizeClass)}>{formatINR(price)}</span>
      {compareAtPrice && compareAtPrice > price ? (
        <span className="text-sm tabular-nums text-muted-foreground line-through">{formatINR(compareAtPrice)}</span>
      ) : null}
    </span>
  )
}

export { formatINR }
