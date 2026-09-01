import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Product } from '@/data/types'
import { categoryConfig, spiceLevelConfig, stockLevelConfig } from '@/lib/status'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const category = categoryConfig[product.category]
  const level = product.stockLevel
  const levelBadge = stockLevelConfig[level]
  const percent = Math.min(100, Math.round((product.unitsPackedThisBatch / product.batchCapacity) * 100))
  const basePack = product.packSizes[0]
  const discountedPrice =
    product.discountPercent > 0 ? basePack.price * (1 - product.discountPercent / 100) : basePack.price

  return (
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-1.5">
              <Badge variant="outline" className={cn('text-[11px]', category.badgeClass)}>
                {category.label}
              </Badge>
              {product.spiceLevel ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <span className={cn('size-1.5 rounded-full', spiceLevelConfig[product.spiceLevel].dotClass)} />
                  {spiceLevelConfig[product.spiceLevel].label}
                </span>
              ) : null}
            </div>
            <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Actions for ${product.name}`}>
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(product)}>
                <Pencil className="size-4" aria-hidden="true" /> Edit product
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(product)}>
                <Trash2 className="size-4" aria-hidden="true" /> Remove product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold tabular-nums text-foreground">
              {formatCurrency(discountedPrice)}
            </span>
            <span className="text-xs text-muted-foreground">/ {basePack.size}</span>
            {product.discountPercent > 0 ? (
              <>
                <span className="font-mono text-xs tabular-nums text-muted-foreground line-through">
                  {formatCurrency(basePack.price)}
                </span>
                <Badge className="border-primary/30 bg-primary/15 text-primary">
                  {product.discountPercent}% off
                </Badge>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.packSizes.map((pack) => (
            <span
              key={pack.size}
              className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground"
            >
              {pack.size} &middot; {formatCurrency(pack.price)}
            </span>
          ))}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>This batch</span>
            <div className="flex items-center gap-2">
              <span className="font-mono tabular-nums">
                {product.unitsPackedThisBatch}/{product.batchCapacity} units
              </span>
              {levelBadge ? (
                <Badge variant="outline" className={levelBadge.badgeClass}>
                  {levelBadge.label}
                </Badge>
              ) : null}
            </div>
          </div>
          <Progress
            value={percent}
            className={cn(
              level === 'low' && '[&>div]:bg-warning',
              level === 'high' && '[&>div]:bg-success',
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
