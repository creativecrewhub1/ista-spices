import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '../../components/EmptyState'
import { ProductCard } from '../../components/ProductCard'
import { products } from '../../data/products'
import { useWishlist } from '../../wishlist/WishlistContext'

export function AccountWishlistPage() {
  const { ids } = useWishlist()
  const wishlisted = products.filter((p) => ids.has(p.id))

  if (wishlisted.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any product to save it here for later."
        action={
          <Button asChild>
            <Link to="/shop">Browse products</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-medium text-foreground">{wishlisted.length} saved items</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
        {wishlisted.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
