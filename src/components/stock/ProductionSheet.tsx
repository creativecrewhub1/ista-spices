import { useMemo, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  Calculator,
  ClipboardCheck,
  Coins,
  Factory,
  NotebookPen,
  PackageCheck,
  Scale,
  Search,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, formatRate } from '@/lib/format'
import { productImage } from '@/lib/productImage'
import { cn } from '@/lib/utils'
import { useInventoryItems, useProductionCosting, useProducts } from '@/data/queries'
import { useDebouncedValue } from '@/lib/useDebouncedValue'

import { formatDateLong } from '@/lib/format'
import type { ProductionRunInput, StockItem } from '@/data/types'

interface ProductionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The whole ledger: what can be made and what can be consumed both come from here. */
  stock: StockItem[]
  onSubmit: (input: ProductionRunInput) => void
  isSaving?: boolean
  error?: string | null
}

export function ProductionSheet({
  open,
  onOpenChange,
  stock,
  onSubmit,
  isSaving,
  error,
}: ProductionSheetProps) {
  const [productId, setProductId] = useState('')
  const [outputQty, setOutputQty] = useState('')
  const [note, setNote] = useState('')
  const [used, setUsed] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [showWorking, setShowWorking] = useState(false)
  // Recording is irreversible in the ledger, so what is about to be consumed
  // is read back and agreed to. The costing does not wait for this — it
  // follows the quantities either way — but the write does.
  const [confirmed, setConfirmed] = useState(false)

  const { data: inventoryItems } = useInventoryItems()
  const { data: products } = useProducts()

  // Helper to resolve real spice photo thumbnail for any stock item
  function getItemImageUrl(itemId: string): string {
    const inv = inventoryItems?.find((i) => i.id === itemId)
    if (inv?.imageUrl) return productImage(inv.imageUrl)
    const prod = products?.find((p) => p.id === itemId)
    if (prod?.imageUrl) return productImage(prod.imageUrl)
    return productImage(null)
  }

  // Only goods the shop makes can be produced, and only bought-in stock is consumed.
  const producible = useMemo(() => stock.filter((s) => s.origin === 'manufactured'), [stock])
  const materials = useMemo(
    () =>
      stock
        .filter((s) => s.origin === 'purchased' && s.itemId !== productId)
        .filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase())),
    [stock, productId, query],
  )

  const output = stock.find((s) => s.itemId === productId)
  const ticked = Object.entries(used).filter(([, qty]) => qty !== '')

  // Keyed on the quantities themselves, so the answer on screen always
  // belongs to the numbers above it.
  const wanted = JSON.stringify({
    outputQty: Number(outputQty),
    inputs: ticked.map(([itemId, qty]) => ({ itemId, qty: Number(qty) })),
  })
  const settled = useDebouncedValue(wanted, 400)
  const costingInput = useMemo(() => {
    const parsed = JSON.parse(settled) as {
      outputQty: number
      inputs: { itemId: string; qty: number }[]
    }
    const usable =
      parsed.outputQty > 0 &&
      parsed.inputs.length > 0 &&
      parsed.inputs.every((line) => line.qty > 0)
    return usable ? parsed : null
  }, [settled])
  const costing = useProductionCosting(costingInput)

  const shortages = ticked.filter(([itemId, qty]) => {
    const material = stock.find((s) => s.itemId === itemId)
    return material ? Number(qty) > material.quantityOnHand : false
  })

  function reset() {
    setShowWorking(false)
    setConfirmed(false)
    setProductId('')
    setOutputQty('')
    setNote('')
    setUsed({})
    setQuery('')
  }

  function toggle(itemId: string, on: boolean) {
    setConfirmed(false)
    setUsed((prev) => {
      const next = { ...prev }
      if (on) next[itemId] = next[itemId] ?? ''
      else delete next[itemId]
      return next
    })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({
      productId,
      outputQty: Number(outputQty),
      note: note.trim() || undefined,
      inputs: ticked.map(([itemId, qty]) => ({ itemId, qty: Number(qty) })),
    })
  }

  const canSubmit =
    productId !== '' &&
    Number(outputQty) > 0 &&
    ticked.length > 0 &&
    ticked.every(([, qty]) => Number(qty) > 0) &&
    shortages.length === 0 &&
    Boolean(costing.data) &&
    confirmed

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <SheetContent className="w-full overflow-y-auto border-l border-orange-100 bg-white p-6 sm:max-w-lg">
        
        {/* HEADER */}
        <SheetHeader className="border-b border-orange-100/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20">
              <Factory className="size-5" aria-hidden="true" />
            </span>
            <div>
              <SheetTitle className="font-display text-2xl font-black text-slate-900 tracking-tight">
                Record Production
              </SheetTitle>
              <SheetDescription className="text-xs font-medium text-slate-500">
                Record batch output yield and raw materials consumed.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form className="flex flex-col gap-5 py-5" onSubmit={handleSubmit}>
          
          {/* 1. PRODUCED MANUFACTURED ITEM */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
              <PackageCheck className="size-3.5 text-orange-500" /> Produced Item
            </Label>
            <Select
              value={productId}
              onValueChange={(value) => {
                setConfirmed(false)
                setProductId(value)
              }}
            >
              <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-4 py-3 font-semibold text-slate-900 focus:border-orange-500 focus:bg-white transition-all">
                <SelectValue placeholder="Choose what was manufactured..." />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} className="rounded-2xl">
                {producible.map((item) => {
                  const imgUrl = getItemImageUrl(item.itemId)
                  return (
                    <SelectItem key={item.itemId} value={item.itemId} className="rounded-xl py-2 font-semibold">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={imgUrl} alt="" className="size-6 rounded-md object-cover border border-slate-200 shrink-0" />
                        <span className="truncate">{item.name}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">({item.stockUnit})</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 2. OUTPUT QUANTITY YIELD */}
          <div className="space-y-1.5">
            <Label
              htmlFor="prod-qty"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <Scale className="size-3.5 text-orange-500" /> Output Quantity {output ? `(${output.stockUnit})` : ''}
            </Label>
            <div className="relative flex items-center">
              <Input
                id="prod-qty"
                type="number"
                min="0"
                step="any"
                required
                value={outputQty}
                onChange={(e) => {
                  setConfirmed(false)
                  setOutputQty(e.target.value)
                }}
                placeholder="e.g. 50"
                className="rounded-2xl border-slate-200 bg-slate-50/70 px-4 py-3 font-mono text-base font-black text-slate-900 focus:border-orange-500 focus:bg-white transition-all pr-16"
              />
              {output ? (
                <span className="absolute right-4 text-xs font-bold uppercase font-mono text-slate-500 pointer-events-none">
                  {output.stockUnit}
                </span>
              ) : null}
            </div>
          </div>

          {/* 3. MATERIALS USED SECTION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Factory className="size-3.5 text-orange-500" /> Raw Materials Consumed
              </Label>
              {ticked.length > 0 && (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold px-2 py-0.5">
                  {ticked.length} material{ticked.length > 1 ? 's' : ''} selected
                </Badge>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find raw material..."
                aria-label="Find a material"
                autoComplete="off"
                className="rounded-2xl border-slate-200 bg-slate-50/70 pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            {/* Materials List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 py-1">
              {materials.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400 rounded-2xl border border-slate-100 bg-slate-50/50">
                  No materials match your search.
                </div>
              ) : (
                materials.map((material) => {
                  const isTicked = material.itemId in used
                  const entered = used[material.itemId] ?? ''
                  const short = entered !== '' && Number(entered) > material.quantityOnHand
                  const imgUrl = getItemImageUrl(material.itemId)

                  return (
                    <div
                      key={material.itemId}
                      className={cn(
                        'group flex items-center justify-between gap-3 rounded-2xl p-3 border transition-all duration-300 shadow-2xs',
                        isTicked
                          ? 'border-orange-500 bg-gradient-to-r from-orange-50/90 via-amber-50/50 to-orange-50/30 ring-2 ring-orange-500/20 shadow-md'
                          : 'border-slate-200/80 bg-slate-50/50 hover:bg-orange-50/40 hover:border-orange-300',
                      )}
                    >
                      {/* Left: Checkbox, Photo, Title & Stock */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Checkbox
                          id={`use-${material.itemId}`}
                          checked={isTicked}
                          onCheckedChange={(value) => toggle(material.itemId, value === true)}
                          aria-label={`Use ${material.name}`}
                          className="size-5 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 shrink-0"
                        />

                        <label
                          htmlFor={`use-${material.itemId}`}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <img
                            src={imgUrl}
                            alt=""
                            className="size-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {material.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold mt-0.5">
                              <span
                                className={cn(
                                  'px-1.5 py-0.2 rounded-md font-mono text-[10px] font-bold border',
                                  material.quantityOnHand > 0
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200',
                                )}
                              >
                                {material.quantityOnHand} {material.stockUnit} available
                              </span>
                              {material.avgUnitCost !== null && (
                                <span className="font-mono text-slate-400 text-[10px]">
                                  {formatCurrency(material.avgUnitCost)}/{material.stockUnit}
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Right: Quantity Input when checked */}
                      {isTicked ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={entered}
                            onChange={(e) =>
                              (setConfirmed(false),
                              setUsed((prev) => ({ ...prev, [material.itemId]: e.target.value })))
                            }
                            placeholder="0"
                            aria-label={`Quantity of ${material.name} used`}
                            className={cn(
                              'w-24 rounded-xl text-center font-mono font-bold text-xs py-1.5 transition-all',
                              short
                                ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-500/20'
                                : 'border-orange-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20',
                            )}
                          />
                          <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                            {material.stockUnit}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>

            {/* SHORTAGE ALERT BADGE */}
            {shortages.length > 0 ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 flex items-center gap-2.5 text-rose-700 text-xs font-bold shadow-2xs">
                <AlertTriangle className="size-4 shrink-0 text-rose-500" />
                <span>
                  Insufficient stock available for:{' '}
                  {shortages.map(([itemId]) => stock.find((s) => s.itemId === itemId)?.name).join(', ')}
                </span>
              </div>
            ) : null}
          </div>

          {/* 4. WHAT THE BATCH COSTS, KEPT IN STEP WITH THE QUANTITIES */}
          {ticked.length > 0 && Number(outputQty) > 0 && shortages.length === 0 ? (
            <div className="space-y-3">
              {costing.isError ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700">
                  {(costing.error as Error).message}
                </p>
              ) : null}

              {costing.isPending && !costing.data ? (
                <p className="rounded-2xl border border-orange-100 bg-orange-50/40 px-3.5 py-3 text-center text-xs font-bold text-slate-400">
                  Costing the batch…
                </p>
              ) : null}

              {costing.data ? (
                <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/90 via-amber-50/60 to-orange-50/30 p-4 shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <Coins className="size-3.5 text-orange-500" /> Total production cost
                      </span>
                      {costing.data.costPerOutputUnit !== null ? (
                        <span className="block text-xs font-semibold text-slate-500">
                          {formatRate(costing.data.costPerOutputUnit)} per{' '}
                          {output?.stockUnit ?? 'unit'}
                        </span>
                      ) : null}
                    </div>
                    <span className="font-mono text-xl font-black tabular-nums text-slate-900">
                      {formatCurrency(costing.data.totalCost)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowWorking((open) => !open)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-white/70 py-2 text-[11px] font-bold uppercase tracking-wider text-orange-700 hover:bg-white"
                  >
                    <Calculator className="size-3.5" aria-hidden="true" />
                    {showWorking ? 'Hide calculation' : 'Calculation'}
                  </button>

                  {/* Which batch each material came out of, and at what it was
                      bought. Oldest first, so the figures can be checked
                      against the consignments they came from. */}
                  {showWorking ? (
                    <div className="mt-3 space-y-3">
                      {costing.data.materials.map((material) => (
                        <div
                          key={material.itemId}
                          className="rounded-xl border border-orange-100 bg-white/80 p-3"
                        >
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-black text-slate-800">
                              {material.itemName}
                            </span>
                            <span className="font-mono text-xs font-bold tabular-nums text-slate-700">
                              {material.qty} {material.unit}
                            </span>
                          </div>
                          <table className="mt-2 w-full text-[11px]">
                            <thead>
                              <tr className="text-left text-slate-400">
                                <th className="font-semibold">Batch</th>
                                <th className="text-right font-semibold">Used</th>
                                <th className="text-right font-semibold">Rate</th>
                                <th className="text-right font-semibold">Cost</th>
                              </tr>
                            </thead>
                            <tbody className="font-mono tabular-nums text-slate-700">
                              {material.drawnFrom.map((draw, index) => (
                                <tr key={draw.batchNo ?? index} className="border-t border-slate-100">
                                  <td className="py-1 font-sans font-semibold">
                                    {draw.batchNo ?? 'Opening balance'}
                                    <span className="block text-[10px] font-medium text-slate-400">
                                      {formatDateLong(draw.arrivedAt)}
                                    </span>
                                  </td>
                                  <td className="py-1 text-right">
                                    {draw.qty} {material.unit}
                                  </td>
                                  <td className="py-1 text-right">
                                    {draw.unitCost === null ? '—' : formatRate(draw.unitCost)}
                                  </td>
                                  <td className="py-1 text-right font-bold">
                                    {formatCurrency(draw.lineCost)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {material.uncovered > 0 ? (
                            <p className="mt-1 text-[10px] font-bold text-amber-700">
                              {material.uncovered} {material.unit} came from stock with no recorded
                              cost, so it adds nothing to the total.
                            </p>
                          ) : null}
                          <div className="mt-1 flex justify-between border-t border-slate-100 pt-1 text-[11px] font-black text-slate-800">
                            <span>Material cost</span>
                            <span className="font-mono tabular-nums">
                              {formatCurrency(material.materialCost)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {/* 5. WHAT IS ABOUT TO BE CONSUMED, READ BACK AND AGREED TO */}
          {ticked.length > 0 && Number(outputQty) > 0 && shortages.length === 0 ? (
            <div
              className={cn(
                'rounded-2xl border p-4 transition-colors',
                confirmed ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50/60',
              )}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <ClipboardCheck className="size-3.5 text-orange-500" /> Confirm what will be consumed
              </span>

              {/* The list above scrolls, so what was ticked is repeated here
                  where it can be read in one go before committing to it. */}
              <ul className="mt-2 space-y-1">
                {ticked.map(([itemId, qty]) => {
                  const material = stock.find((item) => item.itemId === itemId)
                  const line = costing.data?.materials.find((m) => m.itemId === itemId)
                  return (
                    <li
                      key={itemId}
                      className="flex items-baseline justify-between gap-2 border-b border-slate-200/60 pb-1 text-xs last:border-0"
                    >
                      <span className="truncate font-semibold text-slate-700">
                        {material?.name ?? itemId}
                      </span>
                      <span className="shrink-0 font-mono font-bold tabular-nums text-slate-800">
                        {qty} {material?.stockUnit}
                        {line ? (
                          <span className="ml-2 font-sans font-semibold text-slate-400">
                            {formatCurrency(line.materialCost)}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <p className="mt-2 text-[11px] font-medium text-slate-500">
                This comes out of stock as soon as the batch is recorded, oldest
                batch first, and cannot be undone from here.
              </p>

              <label className="mt-3 flex cursor-pointer items-center gap-2">
                <Checkbox
                  checked={confirmed}
                  onCheckedChange={(value) => setConfirmed(value === true)}
                  aria-label="Confirm the materials and quantities"
                />
                <span className="text-xs font-bold text-slate-700">
                  These materials and quantities are correct
                </span>
              </label>
            </div>
          ) : null}

          {/* 5. BATCH NOTE */}
          <div className="space-y-1.5">
            <Label
              htmlFor="prod-note"
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              <NotebookPen className="size-3.5 text-orange-500" /> Note <span className="font-medium normal-case text-slate-400">(optional)</span>
            </Label>
            <Input
              id="prod-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Batch reference number, operator name, etc."
              className="rounded-2xl border-slate-200 bg-slate-50/70 text-xs font-medium focus:border-orange-500 focus:bg-white transition-all"
            />
          </div>

          {error ? (
            <p className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-bold text-rose-700">
              {error}
            </p>
          ) : null}

          {/* 6. SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Recording Production…' : 'Record Production'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
