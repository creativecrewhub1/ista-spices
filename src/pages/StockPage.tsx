import { Fragment, useMemo, useState, type FormEvent } from 'react'
import { ArrowDownToLine, ChevronRight, PackagePlus, Search } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { ItemMovements } from '@/components/stock/ItemMovements'
import { useStock, useStockMovements } from '@/data/queries'
import { useReceiveStock } from '@/data/mutations'
import type { StockItem } from '@/data/types'
import { formatCurrency, formatRate, formatDateLong } from '@/lib/format'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

const MOVEMENT_LABELS: Record<string, { label: string; className: string }> = {
  receipt: { label: 'Stock in', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  sale: { label: 'Despatched', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  consumption: { label: 'Consumed', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  production: { label: 'Produced', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  adjustment: { label: 'Adjusted', className: 'bg-slate-100 text-slate-700 border-slate-200' },
}

function originLabel(item: StockItem): string {
  if (item.origin === 'manufactured') return 'Manufacturing'
  return item.isConsumable ? 'Raw Material' : 'B2B'
}

export function StockPage() {
  const { data: stock, isLoading, error } = useStock()
  const { data: movements } = useStockMovements(undefined, 25)
  const receiveStock = useReceiveStock()

  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [itemId, setItemId] = useState('')
  const [qty, setQty] = useState('')
  const [totalCost, setTotalCost] = useState('')
  const [note, setNote] = useState('')

  const filtered = useMemo(
    () => (stock ?? []).filter((s) => s.name.toLowerCase().includes(query.toLowerCase())),
    [stock, query],
  )

  const totals = useMemo(() => {
    const list = stock ?? []
    return {
      // Only items with a purchase behind them can be valued.
      value: list.reduce((sum, s) => sum + (s.stockValue ?? 0), 0),
      unvalued: list.filter((s) => s.stockValue === null).length,
      lowCount: list.filter((s) => s.isLowStock).length,
      itemCount: list.length,
    }
  }, [stock])

  const selectedItem = (stock ?? []).find((s) => s.itemId === itemId)

  // What the admin is about to record, worked out the same way the database
  // will. Preview only — the total is what gets sent.
  const perUnit =
    Number(qty) > 0 && totalCost !== '' && Number.isFinite(Number(totalCost))
      ? Number(totalCost) / Number(qty)
      : null

  function resetForm() {
    setItemId('')
    setQty('')
    setTotalCost('')
    setNote('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    receiveStock.mutate(
      {
        itemId,
        qty: Number(qty),
        totalCost: Number(totalCost),
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          setFormOpen(false)
          resetForm()
        },
      },
    )
  }

  return (
    <div className={cn('pb-16 min-h-screen bg-[#F7F3ED]', pageEnter)}>
      <TopBar title="Stock" subtitle={`${totals.itemCount} items tracked`} />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-3 py-4 md:px-8 md:py-6">
        {/* Position summary */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Stock value
            </span>
            <span className="mt-0.5 block font-mono text-2xl font-black tabular-nums text-slate-900">
              {formatCurrency(totals.value)}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {totals.unvalued > 0
                ? `${totals.unvalued} item${totals.unvalued > 1 ? 's' : ''} not yet costed`
                : 'At average purchase cost'}
            </span>
          </div>
          <div className="rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Items tracked
            </span>
            <span className="mt-0.5 block font-mono text-2xl font-black tabular-nums text-slate-900">
              {totals.itemCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Across all three types</span>
          </div>
          <div className="rounded-2xl border border-orange-100/80 bg-white p-4 shadow-2xs">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Low stock
            </span>
            <span
              className={cn(
                'mt-0.5 block font-mono text-2xl font-black tabular-nums',
                totals.lowCount > 0 ? 'text-rose-600' : 'text-slate-900',
              )}
            >
              {totals.lowCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">At or below threshold</span>
          </div>
        </div>

        {/* Search + stock in */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="rounded-2xl border-slate-200 bg-white pl-10 pr-4 text-xs font-medium"
              aria-label="Search stock"
            />
          </div>
          <Button
            onClick={() => setFormOpen(true)}
            className="gap-1.5 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-xs font-bold text-white"
          >
            <PackagePlus className="size-4" aria-hidden="true" />
            Stock in
          </Button>
        </div>

        {/* Current position */}
        {isLoading ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-6">
            <CardListSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-orange-100 bg-white p-6">
            <ErrorState message={error.message} />
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-orange-100/80 bg-white shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-orange-50/40">
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Item</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-slate-500">
                      On hand
                    </th>
                    <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-slate-500">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const isOpen = expandedId === item.itemId
                    return (
                    <Fragment key={item.itemId}>
                    <tr
                      onClick={() => setExpandedId(isOpen ? null : item.itemId)}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-orange-50/40',
                        isOpen && 'bg-orange-50/60',
                      )}
                    >
                      <td className="px-4 py-3">
                        <ChevronRight
                          className={cn(
                            'mr-1.5 inline size-3.5 text-slate-400 transition-transform',
                            isOpen && 'rotate-90',
                          )}
                          aria-hidden="true"
                        />
                        <span className="font-bold text-slate-900">{item.name}</span>
                        {item.isLowStock ? (
                          <Badge
                            variant="outline"
                            className="ml-2 border-rose-200 bg-rose-50 text-[10px] font-bold text-rose-700"
                          >
                            Low
                          </Badge>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{originLabel(item)}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-900">
                        {item.quantityOnHand} <span className="text-slate-400">{item.stockUnit}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold tabular-nums text-slate-900">
                        {item.stockValue !== null ? formatCurrency(item.stockValue) : '—'}
                      </td>
                    </tr>

                    {/* The entries behind that position, each with its batch. */}
                    {isOpen ? (
                      <tr className="bg-slate-50/60">
                        <td colSpan={4} className="p-0">
                          <ItemMovements itemId={item.itemId} unit={item.stockUnit} />
                        </td>
                      </tr>
                    ) : null}
                    </Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">No items match your search.</p>
            ) : null}
          </div>
        )}

        {/* Recent movements */}
        <div className="overflow-hidden rounded-3xl border border-orange-100/80 bg-white shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <ArrowDownToLine className="size-4 text-orange-500" aria-hidden="true" />
            <h2 className="font-display text-base font-bold text-slate-900">Recent movements</h2>
          </div>
          {movements?.length ? (
            <ul className="divide-y divide-slate-100">
              {movements.map((m) => {
                const kind = MOVEMENT_LABELS[m.kind] ?? MOVEMENT_LABELS.adjustment
                return (
                  <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                    <Badge variant="outline" className={cn('text-[10px] font-bold', kind.className)}>
                      {kind.label}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-900">
                      {m.itemName}
                      {m.batchNo ? (
                        <span className="ml-2 font-mono text-[10px] font-medium text-slate-400">
                          {m.batchNo}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={cn(
                        'font-mono text-xs font-bold tabular-nums',
                        m.qty > 0 ? 'text-emerald-600' : 'text-rose-600',
                      )}
                    >
                      {m.qty > 0 ? '+' : ''}
                      {m.qty} {m.stockUnit}
                    </span>
                    <span className="hidden w-28 text-right font-mono text-[11px] text-slate-400 sm:block">
                      {m.unitCost !== null ? `@ ${formatCurrency(m.unitCost)}` : ''}
                    </span>
                    <span className="hidden w-32 text-right text-[11px] font-medium text-slate-400 md:block">
                      {formatDateLong(m.occurredAt)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-slate-500">
              Nothing recorded yet. Use “Stock in” to bring stock into the ledger.
            </p>
          )}
        </div>
      </div>

      {/* Stock in form */}
      <Sheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) resetForm()
        }}
      >
        <SheetContent className="w-full overflow-y-auto border-l border-slate-200 bg-white p-6 sm:max-w-md">
          <SheetHeader className="border-b border-slate-100 p-0 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <PackagePlus className="size-5" aria-hidden="true" />
              </span>
              <div>
                <SheetTitle className="font-display text-xl font-black text-slate-900">
                  Stock in
                </SheetTitle>
                <SheetDescription className="text-xs font-medium text-slate-500">
                  Record stock arriving, with what it cost to buy.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <form className="flex flex-col gap-5 py-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Item</Label>
              <Select value={itemId} onValueChange={setItemId}>
                <SelectTrigger className="rounded-2xl border-slate-200 bg-slate-50/70 font-semibold">
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {(stock ?? []).map((item) => (
                    <SelectItem key={item.itemId} value={item.itemId} className="rounded-xl font-semibold">
                      {item.name} · {originLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="stock-qty" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quantity{selectedItem ? ` (${selectedItem.stockUnit})` : ''}
                </Label>
                <Input
                  id="stock-qty"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  placeholder="0"
                  className="rounded-2xl border-slate-200 bg-slate-50/70 font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="stock-cost"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Total cost paid
                </Label>
                <Input
                  id="stock-cost"
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  placeholder="0"
                  className="rounded-2xl border-slate-200 bg-slate-50/70 font-bold"
                />
                {/* Conflating this with the sale price would invert every margin. */}
                <p className="text-[11px] font-medium text-slate-400">
                  The whole consignment, as invoiced — not the selling price.
                </p>
              </div>
            </div>

            {/* Shown, never sent. The database derives the rate from the total,
                so a figure typed here could only disagree with it. */}
            {perUnit !== null ? (
              <div className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Works out at
                </span>
                <span className="ml-2 font-mono text-lg font-black tabular-nums text-slate-900">
                  {formatRate(perUnit)}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {' '}per {selectedItem?.stockUnit ?? 'unit'}
                </span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="stock-note" className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Note <span className="font-medium normal-case text-slate-400">(optional)</span>
              </Label>
              <Input
                id="stock-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Supplier, invoice number…"
                className="rounded-2xl border-slate-200 bg-slate-50/70 font-medium"
              />
            </div>

            {receiveStock.isError ? (
              <p className="text-xs font-semibold text-rose-600">
                {(receiveStock.error as Error).message}
              </p>
            ) : null}

            <SheetFooter className="px-0 pt-2">
              <Button
                type="submit"
                disabled={!itemId || receiveStock.isPending}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 py-3 text-sm font-bold text-white"
              >
                {receiveStock.isPending ? 'Recording…' : 'Record stock in'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
