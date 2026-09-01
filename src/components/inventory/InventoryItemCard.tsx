import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <ItemThumbnail src={item.imageUrl} alt={item.name} />
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className={cn('mb-1 text-[11px]', type.badgeClass)}>
              {type.label}
            </Badge>
            <h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0" aria-label={`Actions for ${item.name}`}>
                <MoreVertical className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEdit(item)}>
                <Pencil className="size-4" aria-hidden="true" /> Edit item
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item)}>
                <Trash2 className="size-4" aria-hidden="true" /> Remove item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-base font-semibold tabular-nums text-foreground">
            {item.quantityOnHand} {item.unit}
          </span>
          {isLow ? (
            <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">
              Low stock
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-success/15 text-success border-success/30">
              Well stocked
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
