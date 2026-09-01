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
import type { PackSizeLabel, Product, ProductCategory, SpiceLevel } from '@/data/types'

interface ProductFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSave: (product: Product) => void
}

const allPackSizes: PackSizeLabel[] = ['250g', '500g', '1kg', '2kg']

const emptyProduct: Product = {
  id: '',
  name: '',
  category: 'spice-powder',
  description: '',
  packSizes: [
    { size: '250g', price: 0 },
    { size: '500g', price: 0 },
    { size: '1kg', price: 0 },
    { size: '2kg', price: 0 },
  ],
  discountPercent: 0,
  spiceLevel: null,
  imageUrl: null,
  batchCapacity: 30,
  unitsPackedThisBatch: 0,
  stockLevel: 'ok',
  isActive: true,
}

export function ProductFormSheet({ open, onOpenChange, product, onSave }: ProductFormSheetProps) {
  const [draft, setDraft] = useState<Product>(product ?? emptyProduct)

  useEffect(() => {
    setDraft(product ?? emptyProduct)
  }, [product, open])

  const isEditing = Boolean(product)

  function updatePackPrice(size: PackSizeLabel, price: number) {
    setDraft((prev) => ({
      ...prev,
      packSizes: prev.packSizes.map((pack) => (pack.size === size ? { ...pack, price } : pack)),
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit product' : 'Add a new product'}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? 'Update details for this spice or oil.'
              : 'Add a freshly made spice powder or cooking oil.'}
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
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Turmeric Powder"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Sourcing, grind, or pressing notes"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Select
                value={draft.category}
                onValueChange={(v: ProductCategory) =>
                  setDraft({ ...draft, category: v, spiceLevel: v === 'cooking-oil' ? null : draft.spiceLevel })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spice-powder">Spice Powder</SelectItem>
                  <SelectItem value="cooking-oil">Cooking Oil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Spice level</Label>
              <Select
                value={draft.spiceLevel ?? 'none'}
                onValueChange={(v: SpiceLevel | 'none') =>
                  setDraft({ ...draft, spiceLevel: v === 'none' ? null : v })
                }
                disabled={draft.category === 'cooking-oil'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not applicable</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Pack sizes & pricing (&#8377;)</Label>
            <div className="grid grid-cols-2 gap-3">
              {allPackSizes.map((size) => {
                const pack = draft.packSizes.find((p) => p.size === size)
                return (
                  <div key={size} className="flex flex-col gap-1.5">
                    <Label htmlFor={`pack-${size}`} className="text-xs font-normal text-muted-foreground">
                      {size}
                    </Label>
                    <Input
                      id={`pack-${size}`}
                      type="number"
                      min={0}
                      value={pack?.price ?? 0}
                      onChange={(e) => updatePackPrice(size, Number(e.target.value))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discount">Discount %</Label>
            <Input
              id="discount"
              type="number"
              min={0}
              max={100}
              value={draft.discountPercent}
              onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">Batch capacity (units)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={draft.batchCapacity}
                onChange={(e) => setDraft({ ...draft, batchCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unitsPacked">Units in hand</Label>
              <Input
                id="unitsPacked"
                type="number"
                min={0}
                value={draft.unitsPackedThisBatch}
                onChange={(e) => setDraft({ ...draft, unitsPackedThisBatch: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-image">Image URL</Label>
            <Input
              id="product-image"
              value={draft.imageUrl ?? ''}
              onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value.trim() || null })}
              placeholder="/images/products/turmeric.jpg"
            />
            <p className="text-xs text-muted-foreground">
              A file under <code>public/images/products/</code>, or a full URL. Leave blank for no photo.
            </p>
          </div>

          <SheetFooter className="px-0">
            <Button type="submit" className="w-full">
              {isEditing ? 'Save changes' : 'Add product'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
