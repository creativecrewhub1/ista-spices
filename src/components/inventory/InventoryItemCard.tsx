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
import type { InventoryItem } from '@/data/types'
import { inventoryItemTypeConfig } from '@/lib/status'
import { formatCurrency } from '@/lib/format'
import { formatPack } from '@/lib/packLabel'
import { useUnits } from '@/data/queries'
import { cn } from '@/lib/utils'

interface InventoryItemCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
}

export function InventoryItemCard({ item, onEdit, onDelete }: InventoryItemCardProps) {
  const { data: units = [] } = useUnits()
  // Defaulted rather than assumed: an older API build does not send this, and
  // a card is not worth a blank screen.
  const packSizes = item.packSizes ?? []
  const type = inventoryItemTypeConfig[item.type]
  const isLow = item.quantityOnHand <= item.lowStockThreshold

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Top Large Photo Preview Container */}
      <div className="relative w-full mb-3">
        <ItemThumbnail src={item.imageUrl} alt={item.name} size="full" />

        {/* Action Menu Overlaid Top Right */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="size-8 rounded-full bg-white/90 shadow-sm backdrop-blur-md hover:bg-white text-slate-700" aria-label={`Actions for ${item.name}`}>
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-1.5 shadow-xl border-slate-200">
              <DropdownMenuItem onSelect={() => onEdit(item)} className="rounded-xl font-semibold cursor-pointer">
                <Pencil className="size-4 mr-2" aria-hidden="true" /> Edit item
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item)} className="rounded-xl font-semibold cursor-pointer">
                <Trash2 className="size-4 mr-2" aria-hidden="true" /> Remove item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content & Details */}
      <div className="space-y-3 p-1 flex-1 flex flex-col justify-between">
        <div>
          <Badge variant="outline" className={cn('mb-1.5 font-bold px-2.5 py-0.5 text-xs', type.badgeClass)}>
            {type.label}
          </Badge>
          <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* What it resells for. Only a bought-in good that is sold has one;
            a raw material is consumed by production. */}
        {packSizes.length > 0 ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-[11px] font-semibold text-slate-400">Selling price</span>
            <span className="flex flex-wrap justify-end gap-x-2 gap-y-0.5">
              {packSizes.map((pack) => (
                <span key={pack.qty} className="font-mono text-xs font-bold tabular-nums text-slate-700">
                  {formatCurrency(pack.price)}
                  <span className="font-sans font-semibold text-slate-400">
                    {' '}
                    / {formatPack(pack.qty, item.salesUnit ?? item.stockUnit, units)}
                  </span>
                </span>
              ))}
            </span>
          </div>
        ) : null}

        {/* What the last consignment cost — the price to reorder at today,
            which the running average hides once older stock is cheaper. */}
        {item.lastPurchaseCost !== null ? (
          <div className="flex items-baseline justify-between gap-2 border-t border-slate-100 pt-2">
            <span className="text-[11px] font-semibold text-slate-400">Last purchased</span>
            <span className="font-mono text-xs font-bold tabular-nums text-slate-700">
              {formatCurrency(item.lastPurchaseCost)}
              <span className="font-sans font-semibold text-slate-400"> / {item.stockUnit}</span>
            </span>
          </div>
        ) : null}

        {/* Quantity & Stock Level Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-black tabular-nums text-slate-900">
              {item.quantityOnHand}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">{item.stockUnit}</span>
          </div>

          {isLow ? (
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold px-2.5 py-0.5 rounded-full text-xs">
              Low stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-2.5 py-0.5 rounded-full text-xs">
              Well stocked
            </Badge>
          )}
        </div>
      </div>

    </Card>
  )
}
