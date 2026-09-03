import { useEffect, useRef, useState, type FormEvent } from 'react'
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
import { AlertCircle, ImageIcon, Layers, Package, Pencil, Plus, Scale, Tag, Trash2 } from 'lucide-react'
import type {
  ItemCategory,
  ItemInput,
  PackSizeLabel,
  ProductCategory,
  SpiceLevel,
} from '@/data/types'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useUnits } from '@/data/queries'

const ALL_PACK_SIZES: PackSizeLabel[] = ['250g', '500g', '1kg', '2kg']

/** Trims a derived reciprocal to something readable without implying more
 *  precision than the conversion has. 1/0.92 shows as 1.087, not 1.0869565…
 */
function formatFactor(value: number): string {
  return Number(value.toFixed(4)).toString()
}

const CATEGORY_OPTIONS: { value: ItemCategory; label: string; hint: string }[] = [
  { value: 'raw_material', label: 'Raw Material', hint: 'Bought in and consumed by production' },
  { value: 'b2b', label: 'B2B', hint: 'Bought in and resold as it is' },
  { value: 'manufacturing', label: 'Manufacturing', hint: 'Made here and sold to customers' },
]

export function emptyItem(category: ItemCategory): ItemInput {
  return {
    id: '',
    category,
    name: '',
    description: '',
    stockUnit: category === 'manufacturing' ? 'pack' : 'kg',
    salesUnit: category === 'raw_material' ? null : category === 'manufacturing' ? 'pack' : 'kg',
    salesToStockFactor: 1,
    lowStockThreshold: 0,
    imageUrl: null,
    productCategory: 'spice-powder',
    spiceLevel: null,
    packSizes: ALL_PACK_SIZES.map((size) => ({ size, price: 0 })),
    discountPercent: 0,
    batchCapacity: 30,
  }
}

interface ItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Null when adding. */
  item: ItemInput | null
  defaultCategory: ItemCategory
  onSave: (item: ItemInput) => void
  isSaving?: boolean
  error?: string | null
}

/**
 * One form for every kind of stock. The category chosen at the top decides
 * which fields apply — pricing and batch size only mean something for goods
 * the shop makes and sells, so they appear only for Manufacturing.
 */
export function ItemFormSheet({
  open,
  onOpenChange,
  item,
  defaultCategory,
  onSave,
  isSaving,
  error,
}: ItemFormSheetProps) {
  const [draft, setDraft] = useState<ItemInput>(item ?? emptyItem(defaultCategory))
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data: units = [] } = useUnits()

  // A conversion between two units of the same dimension is arithmetic:
  // 1 kg is 1000 g regardless of what is being weighed. Only a cross-
  // dimension pair — kg to litres, kg to pieces — needs a person.
  const stockUom = units.find((u) => u.code === draft.stockUnit)
  const salesUom = units.find((u) => u.code === draft.salesUnit)
  const derivedFactor =
    stockUom && salesUom && stockUom.dimension === salesUom.dimension
      ? salesUom.baseFactor / stockUom.baseFactor
      : null
  const effectiveFactor = derivedFactor ?? draft.salesToStockFactor

  useEffect(() => {
    setDraft(item ?? emptyItem(defaultCategory))
  }, [item, defaultCategory, open])

  const isEditing = Boolean(item?.id)
  const isManufacturing = draft.category === 'manufacturing'

  function handleCategoryChange(category: ItemCategory) {
    setDraft((prev) => ({
      ...prev,
      category,
      // Units differ by kind: packs come off a line, raw material is weighed.
      stockUnit: prev.stockUnit || (category === 'manufacturing' ? 'pack' : 'kg'),
      // Nothing sells a raw material, so it carries no selling unit.
      salesUnit: category === 'raw_material' ? null : prev.salesUnit || prev.stockUnit || 'kg',
      spiceLevel: category === 'manufacturing' ? prev.spiceLevel : null,
    }))
  }

  function updatePackPrice(size: PackSizeLabel, price: number) {
    setDraft((prev) => ({
      ...prev,
      packSizes: prev.packSizes.map((pack) => (pack.size === size ? { ...pack, price } : pack)),
    }))
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setDraft((prev) => ({ ...prev, imageUrl: e.target?.result as string }))
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    // Send the figure that was on screen: a same-dimension conversion is
    // computed, not typed, so the draft's own value may be stale.
    onSave(derivedFactor !== null ? { ...draft, salesToStockFactor: derivedFactor } : draft)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto border-l border-slate-200 bg-white p-6 sm:max-w-md">
        <SheetHeader className="border-b border-slate-100 p-0 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              {isEditing ? <Pencil className="size-5" /> : <Plus className="size-5" />}
            </span>
            <div>
              <SheetTitle className="font-display text-xl font-black text-slate-900">
                {isEditing ? 'Edit item' : 'Add item'}
              </SheetTitle>
              <SheetDescription className="text-xs font-medium text-slate-500">
                Choose what kind of stock this is, then fill in its details.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form className="flex flex-col gap-5 py-6" onSubmit={handleSubmit}>
          {/* Category first: it decides what the rest of the form asks for. */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Tag className="size-3.5 text-orange-500" /> Category
            </Label>
            <Select value={draft.category} onValueChange={handleCategoryChange} disabled={isEditing}>
              <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl p-1">
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-xl font-semibold">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] font-medium text-slate-400">
              {isEditing
                ? "An item's category can't change once it has stock history."
                : CATEGORY_OPTIONS.find((o) => o.value === draft.category)?.hint}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-name"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <Package className="size-3.5 text-orange-500" /> Item name
            </Label>
            <Input
              id="item-name"
              required
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder={isManufacturing ? 'e.g. Turmeric Powder' : 'e.g. Black Peppercorns'}
              className="rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-description" className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Description
            </Label>
            <Textarea
              id="item-description"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Sourcing, grind or pressing notes"
              className="resize-none rounded-2xl border-slate-200 bg-slate-50/70 p-3 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-600">
                <Scale className="size-3 text-slate-400" /> Inward unit
              </Label>
              <Select
                value={draft.stockUnit}
                onValueChange={(v) => setDraft({ ...draft, stockUnit: v })}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-bold">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {units.map((u) => (
                    <SelectItem key={u.code} value={u.code} className="rounded-xl font-semibold">
                      {u.name} ({u.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="item-threshold"
                className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-600"
              >
                <AlertCircle className="size-3 text-rose-400" /> Min alert
              </Label>
              <Input
                id="item-threshold"
                type="number"
                min={0}
                value={draft.lowStockThreshold}
                onChange={(e) => setDraft({ ...draft, lowStockThreshold: Number(e.target.value) })}
                className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm font-bold"
              />
            </div>
          </div>

          {/* Stock is counted in the unit it arrives in, but sold in whatever
              unit customers buy — oil comes in by weight and leaves by volume.
              The conversion is what lets a sale deduct the right amount.
              Raw materials skip this: nothing sells them. */}
          {draft.category !== 'raw_material' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-[11px] font-bold uppercase text-slate-600">
                  <Scale className="size-3 text-orange-400" /> Selling unit
                </Label>
                <Select
                  value={draft.salesUnit ?? ''}
                  onValueChange={(v) => setDraft({ ...draft, salesUnit: v })}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-bold">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {units.map((u) => (
                      <SelectItem key={u.code} value={u.code} className="rounded-xl font-semibold">
                        {u.name} ({u.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="item-factor"
                  className="text-[11px] font-bold uppercase text-slate-600"
                >
                  {/* Read inward-first, matching the order the fields appear
                      in and the way density is conventionally written
                      (kg per litre). Same number either way — the stored
                      value is stock consumed per sales unit, so phrasing it
                      this way needs no inversion. */}
                  {draft.stockUnit || 'unit'} per {draft.salesUnit || 'unit'}
                </Label>
                {/* Within a dimension the conversion is arithmetic — 1 kg is
                    1000 g whoever is asked — so it's computed and shown
                    rather than typed. Crossing dimensions needs a density or
                    a per-piece weight, which only the shop knows. */}
                <Input
                  id="item-factor"
                  type="number"
                  min={0}
                  step="any"
                  required
                  readOnly={derivedFactor !== null}
                  disabled={derivedFactor !== null}
                  value={derivedFactor ?? draft.salesToStockFactor}
                  onChange={(e) =>
                    setDraft({ ...draft, salesToStockFactor: Number(e.target.value) })
                  }
                  className={cn(
                    'rounded-2xl border-slate-200 px-3 py-2 text-center text-sm font-bold',
                    derivedFactor !== null ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/70',
                  )}
                />
              </div>
            </div>
          ) : null}

          {/* Both readings of the same figure. The field takes stock per sales
              unit because that number is exact — a density is published as
              0.92 kg/l, and its reciprocal repeats. The inward-first line is
              computed from it, so the direction people think in is on screen
              without a repeating decimal ever being stored. */}
          {draft.category !== 'raw_material' &&
          draft.salesUnit &&
          draft.salesUnit !== draft.stockUnit &&
          effectiveFactor > 0 ? (
            <div className="-mt-2 space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-500">
                1 {draft.stockUnit} (inward) = {formatFactor(1 / effectiveFactor)} {draft.salesUnit}{' '}
                (selling)
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                So selling one {draft.salesUnit} takes {formatFactor(effectiveFactor)}{' '}
                {draft.stockUnit} out of stock.
              </p>
            </div>
          ) : null}

          {/* Only goods the shop makes and sells carry a storefront
              classification, heat level, pricing and a batch size. */}
          {isManufacturing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase text-slate-600">Shop category</Label>
                  <Select
                    value={draft.productCategory}
                    onValueChange={(v: ProductCategory) =>
                      setDraft({
                        ...draft,
                        productCategory: v,
                        spiceLevel: v === 'cooking-oil' ? null : draft.spiceLevel,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-1">
                      <SelectItem value="spice-powder" className="rounded-xl font-semibold">
                        Spice Powder
                      </SelectItem>
                      <SelectItem value="cooking-oil" className="rounded-xl font-semibold">
                        Cooking Oil
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold uppercase text-slate-600">Spice level</Label>
                  <Select
                    value={draft.spiceLevel ?? 'none'}
                    onValueChange={(v: SpiceLevel | 'none') =>
                      setDraft({ ...draft, spiceLevel: v === 'none' ? null : v })
                    }
                    disabled={draft.productCategory === 'cooking-oil'}
                  >
                    <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-1">
                      <SelectItem value="none" className="rounded-xl font-semibold">
                        Not applicable
                      </SelectItem>
                      <SelectItem value="mild" className="rounded-xl font-semibold">Mild</SelectItem>
                      <SelectItem value="medium" className="rounded-xl font-semibold">Medium</SelectItem>
                      <SelectItem value="hot" className="rounded-xl font-semibold">Hot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Layers className="size-3.5 text-orange-500" /> Pack sizes &amp; selling price
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_PACK_SIZES.map((size) => {
                    const pack = draft.packSizes.find((p) => p.size === size)
                    return (
                      <div key={size} className="space-y-1">
                        <Label
                          htmlFor={`pack-${size}`}
                          className="text-[11px] font-medium normal-case text-slate-400"
                        >
                          {size}
                        </Label>
                        <Input
                          id={`pack-${size}`}
                          type="number"
                          min={0}
                          value={pack?.price ?? 0}
                          onChange={(e) => updatePackPrice(size, Number(e.target.value))}
                          className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-bold"
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="text-[11px] font-medium text-slate-400">
                  What customers pay. Leave a size at 0 to not offer it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="item-discount" className="text-[11px] font-bold uppercase text-slate-600">
                    Discount %
                  </Label>
                  <Input
                    id="item-discount"
                    type="number"
                    min={0}
                    max={100}
                    value={draft.discountPercent}
                    onChange={(e) => setDraft({ ...draft, discountPercent: Number(e.target.value) })}
                    className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="item-capacity" className="text-[11px] font-bold uppercase text-slate-600">
                    Batch capacity
                  </Label>
                  <Input
                    id="item-capacity"
                    type="number"
                    min={1}
                    value={draft.batchCapacity}
                    onChange={(e) => setDraft({ ...draft, batchCapacity: Number(e.target.value) })}
                    className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm font-bold"
                  />
                </div>
              </div>
            </>
          ) : null}

          {/* Image */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <ImageIcon className="size-3.5 text-orange-500" /> Photo
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {draft.imageUrl ? (
              <div className="flex items-center gap-3 rounded-2xl border border-orange-200/80 bg-orange-50/40 p-3">
                <img
                  src={draft.imageUrl}
                  alt=""
                  className="size-16 shrink-0 rounded-xl border border-orange-200 object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-900">
                  {draft.name || 'Item photo'}
                </span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setDraft({ ...draft, imageUrl: null })}
                  className="gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-600"
                >
                  <Trash2 className="size-3.5" /> Remove
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/40 p-5 text-center transition-colors hover:border-orange-500"
              >
                <span className="block text-sm font-bold text-slate-900">Upload image</span>
                <span className="mt-0.5 block text-xs text-slate-500">PNG, JPG or WebP</span>
              </button>
            )}
          </div>

          {isManufacturing && draft.packSizes.some((p) => p.price > 0) ? (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Sells from
              </span>
              <span className="ml-2 font-mono text-lg font-black tabular-nums text-slate-900">
                {formatCurrency(Math.min(...draft.packSizes.filter((p) => p.price > 0).map((p) => p.price)))}
              </span>
            </div>
          ) : null}

          {error ? <p className="text-xs font-semibold text-rose-600">{error}</p> : null}

          <SheetFooter className="px-0 pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-bold text-white"
            >
              {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add item'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
