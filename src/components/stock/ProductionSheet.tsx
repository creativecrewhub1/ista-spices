import { useMemo, useState, type FormEvent } from 'react'
import { Factory, Search } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
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

/**
 * Records a batch. What was made is chosen at the top; what went into it is
 * ticked from the materials below, each with the quantity actually used.
 *
 * On-hand sits beside every material because the decision being made is
 * whether there is enough of it, and that answer should not need another
 * screen.
 */
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

  // Only goods the shop makes can be produced, and only bought-in stock is
  // consumed. A product is never an input to itself.
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

  // What the batch will have cost, at each material's average unit cost. The
  // same roll-up the database performs, shown before committing to it.
  const estimatedCost = ticked.reduce((sum, [itemId, qty]) => {
    const material = stock.find((s) => s.itemId === itemId)
    return sum + (material?.avgUnitCost ?? 0) * Number(qty || 0)
  }, 0)

  const shortages = ticked.filter(([itemId, qty]) => {
    const material = stock.find((s) => s.itemId === itemId)
    return material ? Number(qty) > material.quantityOnHand : false
  })

  function reset() {
    setProductId('')
    setOutputQty('')
    setNote('')
    setUsed({})
    setQuery('')
  }

  function toggle(itemId: string, on: boolean) {
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
    shortages.length === 0

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-slate-100 p-0 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Factory className="size-5" aria-hidden="true" />
            </span>
            <div>
              <SheetTitle className="font-display text-xl font-black text-slate-900">
                Record production
              </SheetTitle>
              <SheetDescription className="text-xs font-medium text-slate-500">
                What was made, and what it took to make it.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form className="flex flex-col gap-5 py-6" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Produced
            </Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold">
                <SelectValue placeholder="Choose what was made" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4} className="rounded-2xl">
                {producible.map((item) => (
                  <SelectItem key={item.itemId} value={item.itemId} className="rounded-xl font-semibold">
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="prod-qty"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Output quantity {output ? `(${output.stockUnit})` : ''}
            </Label>
            <Input
              id="prod-qty"
              type="number"
              min="0"
              step="any"
              required
              value={outputQty}
              onChange={(e) => setOutputQty(e.target.value)}
              placeholder="0"
              className="rounded-2xl border-slate-200 bg-slate-50/70 font-bold"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Materials used
            </Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a material..."
                aria-label="Find a material"
                autoComplete="off"
                className="rounded-2xl pl-9"
              />
            </div>

            <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200">
              {materials.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Nothing matches that.
                </li>
              ) : (
                materials.map((material) => {
                  const isTicked = material.itemId in used
                  const entered = used[material.itemId] ?? ''
                  const short = entered !== '' && Number(entered) > material.quantityOnHand
                  return (
                    <li
                      key={material.itemId}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2',
                        isTicked && 'bg-orange-50/50',
                      )}
                    >
                      <Checkbox
                        id={`use-${material.itemId}`}
                        checked={isTicked}
                        onCheckedChange={(value) => toggle(material.itemId, value === true)}
                        aria-label={`Use ${material.name}`}
                      />
                      <label
                        htmlFor={`use-${material.itemId}`}
                        className="min-w-0 flex-1 cursor-pointer"
                      >
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {material.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {material.quantityOnHand} {material.stockUnit} on hand
                          {material.avgUnitCost !== null
                            ? ` · ${formatCurrency(material.avgUnitCost)}/${material.stockUnit}`
                            : ''}
                        </span>
                      </label>
                      {isTicked ? (
                        <div className="flex shrink-0 items-center gap-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            value={entered}
                            onChange={(e) =>
                              setUsed((prev) => ({ ...prev, [material.itemId]: e.target.value }))
                            }
                            placeholder="0"
                            aria-label={`Quantity of ${material.name} used`}
                            className={cn(
                              'w-24 rounded-xl text-right font-bold',
                              short && 'border-red-300 bg-red-50/60',
                            )}
                          />
                          <span className="w-8 text-[11px] font-bold text-slate-400">
                            {material.stockUnit}
                          </span>
                        </div>
                      ) : null}
                    </li>
                  )
                })
              )}
            </ul>

            {shortages.length > 0 ? (
              <p className="text-[11px] font-bold text-red-600">
                More than there is:{' '}
                {shortages.map(([itemId]) => stock.find((s) => s.itemId === itemId)?.name).join(', ')}
                .
              </p>
            ) : null}
          </div>

          {estimatedCost > 0 ? (
            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Batch costs
              </span>
              <span className="ml-2 font-mono text-lg font-black tabular-nums text-slate-900">
                {formatCurrency(estimatedCost)}
              </span>
              {Number(outputQty) > 0 ? (
                <span className="text-xs font-semibold text-slate-400">
                  {' '}
                  &mdash; {formatCurrency(estimatedCost / Number(outputQty))} per{' '}
                  {output?.stockUnit ?? 'unit'}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label
              htmlFor="prod-note"
              className="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Note <span className="font-medium normal-case text-slate-400">(optional)</span>
            </Label>
            <Input
              id="prod-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Batch reference, who ran it..."
              className="rounded-2xl border-slate-200 bg-slate-50/70"
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-bold text-white"
          >
            {isSaving ? 'Recording…' : 'Record production'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
