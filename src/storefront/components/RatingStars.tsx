import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  size?: 'sm' | 'md'
  className?: string
}

export function RatingStars({ rating, size = 'sm', className }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'size-3.5' : 'size-4.5'
  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(starSize, i <= Math.round(rating) ? 'fill-accent text-accent' : 'fill-none text-border')}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
