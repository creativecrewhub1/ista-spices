import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function QuantityStepper({ value, onChange, min = 1, max = 20, size = 'md', className }: QuantityStepperProps) {
  const isSmall = size === 'sm'
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border border-border',
        isSmall ? 'h-8' : 'h-10',
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('rounded-none rounded-l-md hover:bg-muted', isSmall ? 'size-8' : 'size-10')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease quantity"
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </Button>
      <span
        className={cn(
          'flex min-w-9 items-center justify-center font-mono text-sm tabular-nums text-foreground',
        )}
      >
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('rounded-none rounded-r-md hover:bg-muted', isSmall ? 'size-8' : 'size-10')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase quantity"
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}
