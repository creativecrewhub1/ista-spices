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
import { cn } from '@/lib/utils'

interface InventoryItemCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
}

export function InventoryItemCard({ item, onEdit, onDelete }: InventoryItemCardProps) {
  const type = inventoryItemTypeConfig[item.type]
  const isLow = item.quantityOnHand <= item.lowStockThreshold

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
      {/* Top Large Photo Preview Container */}
      <div className="relative w-full mb-3">
        <ItemThumbnail src={item.imageUrl} alt={item.name} size="full" />
        
        {/* Type Badge Overlaid Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className={cn('backdrop-blur-md bg-white/90 text-slate-800 font-bold border-white/60 shadow-xs px-2.5 py-1 text-xs', type.badgeClass)}>
            {type.label}
          </Badge>
        </div>

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
          <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="line-clamp-2 text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Quantity & Stock Level Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl font-black tabular-nums text-slate-900">
              {item.quantityOnHand}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase">{item.unit}</span>
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
