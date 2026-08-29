import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

  function handleAdd() {
    addItem(product, size, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{product.name}</CardTitle>
          <Badge variant="outline" className={categoryConfig[product.category].badgeClass}>
            {categoryConfig[product.category].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{product.description}</p>
        {product.spiceLevel ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={`size-2 rounded-full ${spiceLevelConfig[product.spiceLevel].dotClass}`} />
            {spiceLevelConfig[product.spiceLevel].label}
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <Select value={size} onValueChange={(v) => setSize(v as PackSizeLabel)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {product.packSizes.map((pack) => (
                <SelectItem key={pack.size} value={pack.size}>
                  {pack.size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="font-mono text-sm font-semibold tabular-nums">{formatCurrency(price)}</span>
          <Button
            size="sm"
            className={cn('ml-auto gap-1.5 transition-colors', added && 'bg-success hover:bg-success')}
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
                Add to cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function CatalogPage() {
  const { data: products, isLoading, error } = useCatalog()

  return (
    <div className={cn('pb-8', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <h1 className="mb-1 font-heading text-xl font-semibold">Shop spices &amp; oils</h1>
        <p className="mb-6 text-sm text-muted-foreground">Freshly ground spices and cold-pressed oils, packed to order.</p>

        {isLoading ? (
          <CardListSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
