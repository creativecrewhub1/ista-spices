import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { ProductVisual } from '@/components/shop/ProductVisual'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCatalog } from '@/data/queries'
import { useCart } from '@/shop/CartContext'
import { categoryConfig, spiceLevelConfig } from '@/lib/status'
import { formatCurrency } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { CatalogProduct, PackSizeLabel } from '@/data/types'

function ProductTile({ product }: { product: CatalogProduct }) {
  const { addItem } = useCart()
  const [size, setSize] = useState<PackSizeLabel>(product.packSizes[0]?.size ?? '250g')
  const [added, setAdded] = useState(false)

  const price = product.packSizes.find((p) => p.size === size)?.price ?? 0
  const category = categoryConfig[product.category]

  function handleAdd() {
    addItem(product, size, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col">
      <ProductVisual
        id={product.id}
        category={product.category}
        className="aspect-[4/3] w-full rounded-md transition-transform duration-300 group-hover:scale-[1.01]"
      />

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
        <Badge variant="outline" className={cn('shrink-0 text-[11px]', category.badgeClass)}>
          {category.label}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
      {product.spiceLevel ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn('size-1.5 rounded-full', spiceLevelConfig[product.spiceLevel].dotClass)} />
          {spiceLevelConfig[product.spiceLevel].label}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Pack size for ${product.name}`}>
        {product.packSizes.map((pack) => (
          <button
            key={pack.size}
            type="button"
            role="radio"
            aria-checked={size === pack.size}
            onClick={() => setSize(pack.size)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs transition-colors',
              size === pack.size
                ? 'border-foreground bg-foreground text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground',
            )}
          >
            {pack.size}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-medium tabular-nums text-foreground">{formatCurrency(price)}</span>
        <Button
          size="sm"
          variant="outline"
          className={cn('gap-1.5 transition-colors', added && 'border-success bg-success/10 text-success hover:bg-success/10')}
          onClick={handleAdd}
        >
          {added ? (
            <>
              <Check className="size-3.5 motion-safe:animate-in motion-safe:zoom-in-50" aria-hidden="true" />
              Added
            </>
          ) : (
            <>
              <Plus className="size-3.5" aria-hidden="true" />
              Add
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function CatalogPage() {
  const { data: products, isLoading, error } = useCatalog()

  return (
    <div className={cn('storefront min-h-svh bg-background pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="mb-1.5 font-display text-3xl font-medium text-foreground sm:text-4xl">
          Shop spices &amp; oils
        </h1>
        <p className="mb-8 text-muted-foreground">Freshly ground spices and cold-pressed oils, packed to order.</p>

        {isLoading ? (
          <CardListSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 xl:grid-cols-4">
            {products?.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
