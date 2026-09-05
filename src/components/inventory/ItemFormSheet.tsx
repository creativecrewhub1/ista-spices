import { useRef, useState, type FormEvent } from 'react'
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
import type { ItemCategory, ItemInput, ProductCategory, SpiceLevel } from '@/data/types'
import { formatCurrency } from '@/lib/format'
import { formatPackSize } from '@/lib/packLabel'
import { cn } from '@/lib/utils'
import { useItemCategories, useItemNames, useUnits } from '@/data/queries'
import { matchNames, normaliseName } from '@/lib/nameMatch'

/** Radix needs a value for "no selling unit"; an empty string is not one. */
const NOT_SOLD = '__not_sold__'

export function emptyItem(category: ItemCategory): ItemInput {
  return {
    id: '',
    category,
    name: '',
    description: '',
    stockUnit: 'kg',
    salesUnit: category === 'raw_material' ? null : 'kg',
    salesToStockFactor: 1,
    lowStockThreshold: 0,
    imageUrl: null,
    productCategory: 'spice-powder',
    spiceLevel: null,
    // One row to start from; a new item's prices are its own. Nothing sells
    // a raw material, so it carries none.
    packSizes:
      category === 'manufacturing'
        ? [{ qty: 0.25, price: 0, packaging: null }]
        : category === 'b2b'
          ? [{ qty: 1, price: 0, packaging: null }]
          : [],
    discountPercent: 0,

  }
}

interface ItemFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Null when adding, and while an existing item is still loading. */
  item: ItemInput | null
  /** True while an item is being fetched for editing. */
  isLoading?: boolean
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
  isLoading,
  defaultCategory,
  onSave,
  isSaving,
  error,
}: ItemFormSheetProps) {
  const [draft, setDraft] = useState<ItemInput>(item ?? emptyItem(defaultCategory))
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { data: units = [] } = useUnits()
  const { data: categories = [] } = useItemCategories()
  const { data: itemNames = [] } = useItemNames()
  const [nameFocused, setNameFocused] = useState(false)

  // 1 kg is 1000 g whatever is being weighed, so weight and volume convert
  // by arithmetic. Counted units do not: every one of them carries a base
  // factor of 1, because how many pieces are in a box is a fact about this
  // item's packaging, not about the words "box" and "piece". Deriving it
  // there produced 1 and locked the field, so a box of 20 could not be said.
  const stockUom = units.find((u) => u.code === draft.stockUnit)
  const salesUom = units.find((u) => u.code === draft.salesUnit)
  const measured = stockUom?.dimension === 'weight' || stockUom?.dimension === 'volume'
  const derivedFactor =
    stockUom && salesUom && measured && stockUom.dimension === salesUom.dimension
      ? salesUom.baseFactor / stockUom.baseFactor
      : null

  // Asked the way a person says it — "1 box holds 20 pieces" — and stored the
  // way despatch needs it, as the stock drawn down by one unit sold.
  const salesPerStock =
    draft.salesToStockFactor > 0 ? 1 / draft.salesToStockFactor : 0

  // Rounded for display only. Number() drops the trailing zeros a fixed
  // decimal leaves behind, without a regex that can eat a digit.
  const drawnPerSale =
    draft.salesToStockFactor > 0 ? Number(draft.salesToStockFactor.toFixed(4)) : '—'

  // Only counted units name a packaging — "500 g" is already its own name.
  const countUnits = units.filter((u) => u.dimension === 'count')

  // Sync the draft during render rather than from an effect. An effect runs
  // after the children have mounted, so a select would be handed its real
  // value one render late — and Radix answers a late value by clearing it,
  // which is how the shop category silently emptied itself on every edit.
  const source = `${open}|${item?.id ?? ''}|${defaultCategory}`
  const [syncedFrom, setSyncedFrom] = useState(source)
  if (syncedFrom !== source) {
    setSyncedFrom(source)
    setDraft(item ?? emptyItem(defaultCategory))
  }

  const isEditing = Boolean(item?.id)
  const isManufacturing = draft.category === 'manufacturing'
  // Manufactured goods and bought-in B2B goods are both sold, so both are
  // priced. A raw material is consumed by production and never sold.
  const isSellable = draft.category !== 'raw_material' || Boolean(draft.salesUnit)

  // Suggestions rank by how alike the names look rather than by prefix, so a
  // typo still finds what it meant. Names close enough to be the same item
  // are the only ones that block; "Turmeric Powder" and "Turmeric Fingers"
  // are near matches and both belong in the catalogue.
  const typed = draft.name.trim()
  const wanted = normaliseName(typed)
  const others = itemNames.filter((existing) => existing.id !== draft.id)
  const duplicate = wanted
    ? others.find((existing) => normaliseName(existing.name) === wanted) ?? null
    : null

  // An exact match is spelled out under the field already, so the list would
  // only be showing the items it is not.
  const suggestions = duplicate ? [] : matchNames(others, typed, 5)

  function handleCategoryChange(category: ItemCategory) {
    setDraft((prev) => ({
      ...prev,
      category,
      // A pack size is a quantity of the selling unit, so weight or volume.
      stockUnit: prev.stockUnit || 'kg',
      // Nothing sells a raw material, so it carries no selling unit.
      salesUnit: category === 'raw_material' ? null : prev.salesUnit || prev.stockUnit || 'kg',
      spiceLevel: category === 'manufacturing' ? prev.spiceLevel : null,
      packSizes:
        category === 'raw_material'
          ? []
          : prev.packSizes.length > 0
            ? prev.packSizes
            : [{ qty: category === 'manufacturing' ? 0.25 : 1, price: 0, packaging: null }],
    }))
  }

  function updatePack(index: number, patch: { qty?: number; price?: number; packaging?: string | null }) {
    setDraft((prev) => ({
      ...prev,
      packSizes: prev.packSizes.map((pack, i) => (i === index ? { ...pack, ...patch } : pack)),
    }))
  }

  function addPack() {
    setDraft((prev) => ({
      ...prev,
      packSizes: [...prev.packSizes, { qty: 0, price: 0, packaging: null }],
    }))
  }

  function removePack(index: number) {
    setDraft((prev) => ({ ...prev, packSizes: prev.packSizes.filter((_, i) => i !== index) }))
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

        {isLoading ? (
          <p className="py-10 text-center text-sm font-medium text-slate-400">Loading item…</p>
        ) : (
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
                {categories.map((option) => (
                  <SelectItem key={option.code} value={option.code} className="rounded-xl font-semibold">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] font-medium text-slate-400">
              {isEditing
                ? "An item's category can't change once it has stock history."
                : categories.find((o) => o.code === draft.category)?.hint}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="item-name"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <Package className="size-3.5 text-orange-500" /> Item name
            </Label>
            <div className="relative">
              <Input
                id="item-name"
                required
                // The browser's own history offers whatever was ever typed
                // here, typos included. The catalogue below is the real list.
                autoComplete="off"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                onFocus={() => setNameFocused(true)}
                onBlur={() => window.setTimeout(() => setNameFocused(false), 150)}
                placeholder={isManufacturing ? 'e.g. Turmeric Powder' : 'e.g. Black Peppercorns'}
                className={cn(
                  'rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold',
                  duplicate && 'border-red-300 bg-red-50/60',
                )}
              />
              {nameFocused && suggestions.length > 0 ? (
                <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((existing) => (
                    <li key={existing.id}>
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, name: existing.name })}
                        className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50"
                      >
                        <span>{existing.name}</span>
                        <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">
                          {categories.find((o) => o.code === existing.category)?.label ?? existing.category}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {duplicate ? (
              <p className="flex items-start gap-1.5 text-[11px] font-bold text-red-600">
                <AlertCircle className="mt-px size-3.5 shrink-0" />
                {`"${duplicate.name}" already exists. Edit that item instead of adding it twice.`}
              </p>
            ) : null}
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

          {/* Units: Inward Unit and Selling Unit side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Scale className="size-3.5 text-orange-500" /> Inward unit
              </Label>
              <Select
                value={draft.stockUnit}
                onValueChange={(v) =>
                  setDraft({
                    ...draft,
                    stockUnit: v,
                    salesToStockFactor: v === draft.salesUnit ? 1 : draft.salesToStockFactor,
                  })
                }
              >
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-900">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="rounded-2xl">
                  {units.map((u) => (
                    <SelectItem key={u.code} value={u.code} className="rounded-xl font-semibold">
                      {u.name} ({u.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Scale className="size-3.5 text-orange-500" /> Selling unit
              </Label>
              <Select
                value={draft.salesUnit ?? NOT_SOLD}
                onValueChange={(value) => {
                  const salesUnit = value === NOT_SOLD ? null : value
                  setDraft({
                    ...draft,
                    salesUnit,
                    // Nothing to convert once it is not for sale, and a unit
                    // converted to itself is 1.
                    salesToStockFactor:
                      salesUnit === null || salesUnit === draft.stockUnit
                        ? 1
                        : draft.salesToStockFactor,
                    // A price is meaningless without a unit to price by.
                    packSizes: salesUnit === null && draft.category === 'raw_material'
                      ? []
                      : draft.packSizes.length > 0
                        ? draft.packSizes
                        : [{ qty: 1, price: 0, packaging: null }],
                  })
                }}
              >
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4} className="rounded-2xl">
                  {/* Only a raw material can decline to be sold; the other two
                      exist to be sold. */}
                  {draft.category === 'raw_material' ? (
                    <SelectItem value={NOT_SOLD} className="rounded-xl font-semibold">
                      N/A — not sold
                    </SelectItem>
                  ) : null}
                  {units.map((u) => (
                    <SelectItem key={u.code} value={u.code} className="rounded-xl font-semibold">
                      {u.name} ({u.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* How much of what is bought becomes what is sold. Without it a
              sale cannot know how much stock to draw down. */}
          {!isManufacturing && draft.salesUnit && draft.salesUnit !== draft.stockUnit ? (
            <div className="space-y-1.5">
              <Label htmlFor="item-factor" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                How many {draft.salesUnit} in one {draft.stockUnit}?
              </Label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm font-bold text-slate-500">
                  1 {draft.stockUnit} =
                </span>
                <Input
                  id="item-factor"
                  type="number"
                  min={0}
                  step="any"
                  required
                  readOnly={derivedFactor !== null}
                  disabled={derivedFactor !== null}
                  value={derivedFactor !== null ? 1 / derivedFactor : salesPerStock || ''}
                  onChange={(e) => {
                    const perStock = Number(e.target.value)
                    setDraft({
                      ...draft,
                      salesToStockFactor: perStock > 0 ? 1 / perStock : 0,
                    })
                  }}
                  className={cn(
                    'rounded-2xl border-slate-200 px-3.5 py-2.5 text-center text-sm font-bold',
                    derivedFactor !== null ? 'bg-slate-100 text-slate-500' : 'bg-slate-50/70',
                  )}
                />
                <span className="shrink-0 text-sm font-bold text-slate-500">{draft.salesUnit}</span>
              </div>
              <p className="text-[11px] font-medium text-slate-400">
                {derivedFactor !== null
                  ? 'Worked out from the units themselves.'
                  : `Selling one ${draft.salesUnit} takes ${drawnPerSale} ${draft.stockUnit} out of stock.`}
              </p>
            </div>
          ) : null}

          {isManufacturing && draft.salesUnit && draft.salesUnit !== draft.stockUnit ? (
            <p className="-mt-2 text-[11px] font-medium text-slate-400">
              How many {draft.salesUnit} come out of each {draft.stockUnit} is measured from
              production, not set here.
            </p>
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
            </>
          ) : null}

          {/* A price is what makes an item sellable. A B2B good is resold as
              it was bought, so it is priced the same way — one quantity of
              its selling unit, one amount — and everything downstream reads
              it without a special case. */}
          {isSellable ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Layers className="size-3.5 text-orange-500" />{' '}
                {isManufacturing ? 'Pack sizes & selling price' : 'Selling price'}
              </Label>
                <div className="space-y-2">
                  {draft.packSizes.map((pack, index) => (
                    <div key={index} className="flex items-end gap-2">
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`pack-qty-${index}`}
                          className="text-[11px] font-medium normal-case text-slate-400"
                        >
                          Pack holds
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <Input
                            id={`pack-qty-${index}`}
                            type="number"
                            min={0}
                            step="any"
                            value={pack.qty || ''}
                            onChange={(e) => updatePack(index, { qty: Number(e.target.value) })}
                            className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-bold"
                          />
                          <span className="shrink-0 text-xs font-bold text-slate-500">
                            {draft.salesUnit}
                          </span>
                        </div>
                      </div>
                      <div className="w-28 space-y-1">
                        <Label className="text-[11px] font-medium normal-case text-slate-400">
                          Sold as
                        </Label>
                        <Select
                          value={pack.packaging ?? 'none'}
                          onValueChange={(v) => updatePack(index, { packaging: v === 'none' ? null : v })}
                        >
                          <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent position="popper" sideOffset={4} className="rounded-2xl">
                            <SelectItem value="none" className="rounded-xl font-semibold">
                              {salesUom?.dimension === 'count' && pack.qty === 1
                                ? salesUom.name
                                : 'Just the quantity'}
                            </SelectItem>
                            {countUnits.map((u) => (
                              <SelectItem key={u.code} value={u.code} className="rounded-xl font-semibold">
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`pack-price-${index}`}
                          className="text-[11px] font-medium normal-case text-slate-400"
                        >
                          Price
                        </Label>
                        <Input
                          id={`pack-price-${index}`}
                          type="number"
                          min={0}
                          value={pack.price || ''}
                          onChange={(e) => updatePack(index, { price: Number(e.target.value) })}
                          className="rounded-2xl border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-bold"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove pack size ${index + 1}`}
                        onClick={() => removePack(index)}
                        className="mb-0.5 shrink-0 rounded-2xl text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPack}
                  className="w-full gap-1.5 rounded-2xl border-dashed font-bold"
                >
                  <Plus className="size-4" /> Add pack size
                </Button>
                <p className="text-[11px] font-medium text-slate-400">
                  {draft.packSizes.length > 0 && draft.salesUnit
                    ? `Customers will see ${draft.packSizes
                        .filter((pack) => pack.qty > 0)
                        .map((pack) => formatPackSize(pack, draft.salesUnit as string, units))
                        .join(', ') || '—'}.`
                    : 'Add the quantities this is sold in.'}
                </p>
            </div>
          ) : null}

          {isManufacturing ? (
            <>
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
              // The server refuses a clash too; this just saves a round trip
              // to be told what the field already says.
              disabled={isSaving || Boolean(duplicate)}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-bold text-white"
            >
              {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add item'}
            </Button>
          </SheetFooter>
        </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
