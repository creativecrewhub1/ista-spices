import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { InventoryItem, InventoryItemType } from '@/data/types'

interface InventoryItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem | null
  /** Which tab the sheet was opened from — decides the default type for a new item. */
  defaultType: InventoryItemType
  onSave: (item: InventoryItem) => void
}

function emptyItem(type: InventoryItemType): InventoryItem {
  return {
    id: '',
    type,
    name: '',
    description: '',
    unit: 'kg',
    quantityOnHand: 0,
    lowStockThreshold: 0,
    isActive: true,
    imageUrl: null,
  }
}

export function InventoryItemFormSheet({
  open,
  onOpenChange,
  item,
  defaultType,
  onSave,
}: InventoryItemFormSheetProps) {
  const [draft, setDraft] = useState<InventoryItem>(item ?? emptyItem(defaultType))

  useEffect(() => {
    setDraft(item ?? emptyItem(defaultType))
  }, [item, defaultType, open])

  const isEditing = Boolean(item)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit item' : 'Add a new item'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update this stock item.' : 'Add a raw material or B2B stock item.'}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-4 px-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(draft)
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-name">Item name</Label>
            <Input
              id="item-name"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Coriander Seeds"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Sourcing or usage notes"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select
              value={draft.type}
              onValueChange={(v: InventoryItemType) => setDraft({ ...draft, type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw_material">Raw Material</SelectItem>
                <SelectItem value="b2b">B2B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-unit">Unit</Label>
              <Input
                id="item-unit"
                required
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                placeholder="kg, litres, pieces"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-qty">Quantity in hand</Label>
              <Input
                id="item-qty"
                type="number"
                min={0}
                value={draft.quantityOnHand}
                onChange={(e) => setDraft({ ...draft, quantityOnHand: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="item-threshold">Low-stock at</Label>
              <Input
                id="item-threshold"
                type="number"
                min={0}
                value={draft.lowStockThreshold}
                onChange={(e) => setDraft({ ...draft, lowStockThreshold: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="item-image">Image URL</Label>
            <Input
              id="item-image"
              value={draft.imageUrl ?? ''}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value.trim() || null })}
              placeholder="/images/products/coriander.jpg"
            />
            <p className="text-xs text-muted-foreground">
              A file under <code>public/images/products/</code>, or a full URL. Leave blank for no photo.
            </p>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" className="w-full">
              {isEditing ? 'Save changes' : 'Add item'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
