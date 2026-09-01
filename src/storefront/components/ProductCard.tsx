import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { ProductVisual } from './ProductVisual'
import { RatingStars } from './RatingStars'
import { PriceTag } from './PriceTag'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useWishlist } from '../wishlist/WishlistContext'
import { useCart } from '../cart/CartContext'
import { productImage } from '../data/images'
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
  const photo = productImage(product.slug)

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-lg',
        className,
      )}
    >
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block" tabIndex={-1}>
          <ProductVisual
            accent={product.accent}
            src={photo}
            alt={product.name}
            /* Packshots read as a shoot, not a cutout, when they sit contained
               on one studio colour — same treatment across the whole grid. */
            fit="contain"
            backdrop={photo ? 'sand' : 'accent'}
            className="aspect-[4/5] w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {product.badges.length > 0 ? (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.badges.map((badge) => (
              <Badge key={badge} className="border-none bg-primary text-primary-foreground shadow-sm">
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
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Heart className={cn('size-4', isWishlisted && 'fill-primary text-primary')} aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to={`/product/${product.slug}`} className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
          <p className="line-clamp-1 text-xs text-muted-foreground">{product.tagline}</p>
        </Link>

        <div className="flex items-center gap-1.5">
          <RatingStars rating={product.rating} />
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <PriceTag price={baseVariant.price} />
          {/* Always visible — a CTA that only appears on hover is invisible on
              touch, which is most of this storefront's traffic. */}
          <Button type="button" size="sm" onClick={() => addItem(product, baseVariant, 1)}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  )
}
