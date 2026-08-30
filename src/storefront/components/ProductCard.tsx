import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { ProductVisual } from './ProductVisual'
import { RatingStars } from './RatingStars'
import { PriceTag } from './PriceTag'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWishlist } from '../wishlist/WishlistContext'
import { useCart } from '../cart/CartContext'
import type { Product } from '../data/types'
import { cn } from '@/lib/utils'

const BADGE_LABEL: Record<string, string> = {
  bestseller: 'Bestseller',
  new: 'New',
  limited: 'Limited',
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { has, toggle } = useWishlist()
  const { addItem } = useCart()
  const isWishlisted = has(product.id)
  const baseVariant = product.variants[0]

  return (
    <div className={cn('group flex flex-col', className)}>
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" tabIndex={-1}>
          <ProductVisual
            accent={product.accent}
            className="aspect-[4/5] w-full rounded-md transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {product.badges.length > 0 ? (
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} className="border-none bg-background/90 text-foreground shadow-none">
                {BADGE_LABEL[badge]}
              </Badge>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn('size-4', isWishlisted && 'fill-accent text-accent')} aria-hidden="true" />
        </button>
      </div>

      <Link to={`/product/${product.slug}`} className="mt-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <p className="line-clamp-1 text-xs text-muted-foreground">{product.tagline}</p>
      </Link>

      <div className="mt-1.5 flex items-center gap-1.5">
        <RatingStars rating={product.rating} />
        <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <PriceTag price={baseVariant.price} />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="sm:opacity-0 sm:transition-opacity sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
          onClick={() => addItem(product, baseVariant, 1)}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
