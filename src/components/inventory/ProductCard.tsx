import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ItemThumbnail } from './ItemThumbnail'
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
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Top Large Photo Preview Container */}
      <div className="relative w-full mb-3">
        <ItemThumbnail src={product.imageUrl} alt={product.name} size="full" />

        {/* Category & Spice Level Overlaid Top Left */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={cn('backdrop-blur-md bg-white/90 text-slate-800 font-bold border-white/60 shadow-xs px-2.5 py-1 text-xs', category.badgeClass)}>
            {category.label}
          </Badge>
          {product.spiceLevel ? (
            <Badge variant="outline" className="backdrop-blur-md bg-white/90 text-slate-700 font-semibold border-white/60 shadow-xs px-2 py-0.5 text-xs flex items-center gap-1">
              <span className={cn('size-2 rounded-full', spiceLevelConfig[product.spiceLevel].dotClass)} />
              {spiceLevelConfig[product.spiceLevel].label}
            </Badge>
          ) : null}
        </div>

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
            <span className="text-xs font-bold text-slate-400">/ {basePack.size}</span>
            {product.discountPercent > 0 ? (
              <span className="font-mono text-xs tabular-nums text-slate-400 line-through">
                {formatCurrency(basePack.price)}
              </span>
            ) : null}
          </div>
        </div>

        {/* Pack Sizes */}
        <div className="flex flex-wrap gap-1">
          {product.packSizes.map((pack) => (
            <span
              key={pack.size}
              className="rounded-lg border border-slate-200/60 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600"
            >
              {pack.size} &middot; {formatCurrency(pack.price)}
            </span>
          ))}
        </div>

        {/* Batch Capacity Progress Bar */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Batch Capacity</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono tabular-nums text-slate-900">
                {product.unitsPackedThisBatch}/{product.batchCapacity}
              </span>
              {levelBadge ? (
                <Badge variant="outline" className={cn('text-[10px] font-bold px-1.5 py-0', levelBadge.badgeClass)}>
                  {levelBadge.label}
                </Badge>
              ) : null}
            </div>
          </div>
          <Progress
            value={percent}
            className={cn(
              'h-2 rounded-full',
              level === 'low' && '[&>div]:bg-amber-500',
              level === 'high' && '[&>div]:bg-emerald-500',
            )}
          />
        </div>
      </div>

    </Card>
  )
}
