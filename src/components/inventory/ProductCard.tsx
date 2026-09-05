import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ItemThumbnail } from './ItemThumbnail'
import type { Product } from '@/data/types'
import { categoryConfig, manufacturingBadge, spiceLevelConfig, stockLevelConfig } from '@/lib/status'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatPackSize } from '@/lib/packLabel'
import { useUnits } from '@/data/queries'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { data: units = [] } = useUnits()
  const category = categoryConfig[product.category]
  const level = product.stockLevel
  const levelBadge = stockLevelConfig[level]
  const packSizes = product.packSizes ?? []
  // A manufactured product is validated to have at least one priced pack, but
  // an older row need not, and an unpriced card should still draw.
  const basePack = packSizes[0] ?? { qty: 0, price: 0 }
  const discountedPrice =
    product.discountPercent > 0 ? basePack.price * (1 - product.discountPercent / 100) : basePack.price

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Top Large Photo Preview Container */}
      <div className="relative w-full mb-3">
        <ItemThumbnail src={product.imageUrl} alt={product.name} size="full" />

        {/* Action Menu Overlaid Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="size-8 rounded-full bg-white/90 shadow-sm backdrop-blur-md hover:bg-white text-slate-700" aria-label={`Actions for ${product.name}`}>
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 shadow-xl border-slate-200">
              <DropdownMenuItem onSelect={() => onEdit(product)} className="rounded-xl font-semibold cursor-pointer">
                <Pencil className="size-4 mr-2" aria-hidden="true" /> Edit product
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(product)} className="rounded-xl font-semibold cursor-pointer">
                <Trash2 className="size-4 mr-2" aria-hidden="true" /> Remove product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Discount Badge Overlaid Bottom Right */}
        {product.discountPercent > 0 ? (
          <div className="absolute bottom-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-2.5 py-0.5 shadow-md text-xs">
              {product.discountPercent}% OFF
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Details & Pricing */}
      <div className="space-y-3 p-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-1.5 flex flex-wrap gap-1.5">
            {/* Which of the three categories it is, first and on every card —
                a search spans all of them, so the tab no longer says. */}
            <Badge
              variant="outline"
              className={cn('font-bold px-2.5 py-0.5 text-xs', manufacturingBadge.badgeClass)}
            >
              {manufacturingBadge.label}
            </Badge>
            <Badge variant="outline" className={cn('font-bold px-2.5 py-0.5 text-xs', category.badgeClass)}>
              {category.label}
            </Badge>
            {product.spiceLevel ? (
              <Badge variant="outline" className="font-semibold px-2 py-0.5 text-xs flex items-center gap-1">
                <span className={cn('size-2 rounded-full', spiceLevelConfig[product.spiceLevel].dotClass)} />
                {spiceLevelConfig[product.spiceLevel].label}
              </Badge>
            ) : null}
          </div>
          <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Pricing Tiers */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-black tabular-nums text-slate-900">
              {formatCurrency(discountedPrice)}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {formatPackSize(basePack, product.salesUnit, units)}
            </span>
            {product.discountPercent > 0 ? (
              <span className="font-mono text-xs tabular-nums text-slate-400 line-through">
                {formatCurrency(basePack.price)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Pack Sizes */}
        <div className="flex flex-wrap gap-1">
          {packSizes.map((pack) => (
            <span
              key={pack.qty}
              className="rounded-lg border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600"
            >
              {formatPackSize(pack, product.salesUnit, units)} &middot; {formatCurrency(pack.price)}
            </span>
          ))}
        </div>

        {/* What the last consignment cost, where one has been recorded. */}
        {product.lastPurchaseCost !== null ? (
          <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {product.lastBatchKind === 'production' ? 'Last produced' : 'Last purchased'}
              {product.lastBatchNo ? (
                <span className="ml-1 font-mono text-[10px] text-slate-400">{product.lastBatchNo}</span>
              ) : null}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-700">
              {formatCurrency(product.lastPurchaseCost)}
            </span>
          </div>
        ) : null}

        {/* In stock */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-black tabular-nums text-slate-900">
              {product.unitsPackedThisBatch}
            </span>
            <span className="text-xs font-bold uppercase text-slate-500">{product.stockUnit}</span>
          </div>
          {levelBadge ? (
            <Badge
              variant="outline"
              className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', levelBadge.badgeClass)}
            >
              {levelBadge.label}
            </Badge>
          ) : null}
        </div>
      </div>

    </Card>
  )
}
