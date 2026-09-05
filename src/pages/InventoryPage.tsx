import { useMemo, useState } from 'react'
import { Archive, Plus, Search, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProductCard } from '@/components/inventory/ProductCard'
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard'
import { ItemFormSheet } from '@/components/inventory/ItemFormSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import {
  useInventoryItems,
  useItem,
  useItemCategories,
  useItemNames,
  useProducts,
  useRemovalCheck,
  useRemovedItems,
} from '@/data/queries'
import { useDeleteItem, useRestoreItem, useSaveItem } from '@/data/mutations'
import { RemovedItemsDialog } from '@/components/inventory/RemovedItemsDialog'
import type { InventoryItem, ItemCategory, ItemInput, Product } from '@/data/types'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { matchNames } from '@/lib/nameMatch'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type Row = { kind: 'product'; data: Product } | { kind: 'inventory'; data: InventoryItem }

const TAB_LABELS: Record<ItemCategory, string> = {
  raw_material: 'raw materials',
  b2b: 'B2B items',
  manufacturing: 'products',
}

export function InventoryPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ItemCategory>('raw_material')

  // Don't fire a request on every keystroke.
  const debouncedQuery = useDebouncedValue(query, 300)
  const search = debouncedQuery || undefined
  const isManufacturingTab = tab === 'manufacturing'
  // Searching stops the tab from filtering. Someone looking for an item knows
  // its name, not which of the three categories it was filed under, and
  // "no items match" while it sits under the next tab is simply wrong.
  const searching = Boolean(search)

  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(search, searching || isManufacturingTab)
  const {
    data: inventoryItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useInventoryItems(
    { type: searching ? undefined : tab, search },
    searching || !isManufacturingTab,
  )

  const saveItem = useSaveItem()
  const deleteItem = useDeleteItem()
  const restoreItem = useRestoreItem()
  const [removedOpen, setRemovedOpen] = useState(false)
  const { data: removedItems = [], isLoading: removedLoading } = useRemovedItems(removedOpen)

  const [formOpen, setFormOpen] = useState(false)
  // The id only. The form is loaded from the API so nothing editable is
  // reconstructed from a list row and then saved back as a guess.
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data: editing = null, isFetching: fetchingItem } = useItem(editingId)
  // Loaded means "this item, freshly read". The form copies the item into a
  // draft once, when it mounts, so anything arriving after that never reaches
  // the fields — waiting for the fetch is what makes an edit show the value
  // that was actually saved rather than the one cached before it.
  const editLoading = Boolean(editingId) && (fetchingItem || editing?.id !== editingId)
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)
  // The server decides what may be removed; the dialog only reports it.
  const { data: removal, isFetching: checkingRemoval } = useRemovalCheck(deleting?.id ?? null)

  const isLoading = productsLoading || itemsLoading
  const error = productsError ?? itemsError

  // Search and category filtering are applied server-side.
  const filteredRows: Row[] = useMemo(() => {
    const made: Row[] = (products ?? []).map((p) => ({ kind: 'product' as const, data: p }))
    const boughtIn: Row[] = (inventoryItems ?? []).map((i) => ({ kind: 'inventory' as const, data: i }))
    if (searching) {
      // One list, alphabetical: the categories they came from are on the cards.
      return [...boughtIn, ...made].sort((a, b) => a.data.name.localeCompare(b.data.name))
    }
    return isManufacturingTab ? made : boughtIn
  }, [products, inventoryItems, isManufacturingTab, searching])

  // Names for the dropdown under the box, matched the same way the add form
  // matches them, so both agree on what "close enough" means.
  const { data: itemNames = [] } = useItemNames()
  // The category labels come from the table the generated column references,
  // not from a copy kept in the client.
  const { data: categories = [] } = useItemCategories()
  const [searchFocused, setSearchFocused] = useState(false)
  const nameHints = useMemo(() => matchNames(itemNames, query, 6), [itemNames, query])

  function openAdd() {
    setEditingId(null)
    saveItem.reset()
    setFormOpen(true)
  }

  function openEdit(id: string) {
    setEditingId(id)
    saveItem.reset()
    setFormOpen(true)
  }

  function handleSave(item: ItemInput) {
    saveItem.mutate(item, {
      onSuccess: () => {
        setFormOpen(false)
        setEditingId(null)
      },
    })
  }

  // Stock on hand and unfinished orders both have to be settled first.
  const blocked = Boolean(removal && !removal.canRemove)

  function handleDeleteConfirm() {
    if (!deleting || blocked || checkingRemoval) return
    deleteItem.mutate(deleting.id)
    setDeleting(null)
  }

  return (
    <div className={cn('pb-8', pageEnter)}>
      {/* Counts what's actually listed — only the tab in view is fetched. */}
      <TopBar
        title="Products & Inventory"
        subtitle={
          searching
            ? `${filteredRows.length} ${filteredRows.length === 1 ? 'item' : 'items'} matching "${debouncedQuery}"`
            : `${filteredRows.length} ${TAB_LABELS[tab]}`
        }
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search every category..."
              className={cn('pl-9', query && 'pr-9')}
              aria-label="Search inventory"
              autoComplete="off"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            ) : null}
            {searchFocused && nameHints.length > 0 ? (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                {nameHints.map((hint) => (
                  <li key={hint.id}>
                    <button
                      type="button"
                      onClick={() => setQuery(hint.name)}
                      className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-orange-50"
                    >
                      <span className="truncate">{hint.name}</span>
                      <span className="shrink-0 text-[10px] font-bold uppercase text-slate-400">
                        {categories.find((o) => o.code === hint.category)?.label ?? hint.category}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setRemovedOpen(true)} className="gap-1.5">
              <Archive className="size-4" aria-hidden="true" />
              Removed
            </Button>
            {/* One way in, whatever the tab — the category is chosen in the form. */}
            <Button onClick={openAdd} className="gap-1.5">
              <Plus className="size-4" aria-hidden="true" />
              Add item
            </Button>
          </div>
        </div>

{/* The tabs are hidden while searching rather than sitting there looking
            selected when they are no longer filtering anything. Each result
            card names its own category instead. */}
        {searching ? null : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as ItemCategory)}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="raw_material">Raw Material</TabsTrigger>
              <TabsTrigger value="b2b">B2B</TabsTrigger>
              <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {isLoading ? (
          <CardListSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : filteredRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {searching
              ? `Nothing in the catalogue matches "${debouncedQuery}".`
              : 'Nothing here yet.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRows.map((row) =>
              row.kind === 'product' ? (
                <ProductCard
                  key={row.data.id}
                  product={row.data}
                  onEdit={(p) => openEdit(p.id)}
                  onDelete={(p) => setDeleting({ id: p.id, name: p.name })}
                />
              ) : (
                <InventoryItemCard
                  key={row.data.id}
                  item={row.data}
                  onEdit={(i) => openEdit(i.id)}
                  onDelete={(i) => setDeleting({ id: i.id, name: i.name })}
                />
              ),
            )}
          </div>
        )}
      </div>

      <ItemFormSheet
        // Remounts per item so no select is handed a new value after mount.
        key={editingId ?? 'new'}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingId(null)
        }}
        item={editing}
        isLoading={editLoading}
        defaultCategory={tab}
        onSave={handleSave}
        isSaving={saveItem.isPending}
        error={saveItem.isError ? (saveItem.error as Error).message : null}
      />

      <RemovedItemsDialog
        open={removedOpen}
        onOpenChange={setRemovedOpen}
        items={removedItems}
        isLoading={removedLoading}
        onRestore={(id) => restoreItem.mutate(id)}
        restoringId={restoreItem.isPending ? (restoreItem.variables as string) : null}
        error={restoreItem.isError ? (restoreItem.error as Error).message : null}
      />

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {checkingRemoval ? 'Checking…' : blocked ? 'Not ready to remove' : 'Remove item?'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                {checkingRemoval || !removal ? (
                  <p>Checking what still depends on "{deleting?.name}"…</p>
                ) : blocked ? (
                  <>
                    <p className="font-semibold text-amber-700">
                      {[
                        removal.quantityOnHand !== 0
                          ? `${removal.quantityOnHand} ${removal.stockUnit} still in stock`
                          : null,
                        removal.openOrders !== 0
                          ? `${removal.openOrders} order ${removal.openOrders === 1 ? 'line' : 'lines'} not delivered yet`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' and ')}
                      .
                    </p>
                    <p>
                      {removal.quantityOnHand !== 0
                        ? 'Account for the stock — sell it, consume it in production, or write it off in Stock. '
                        : ''}
                      {removal.openOrders !== 0
                        ? 'Finish or cancel the outstanding orders. '
                        : ''}
                      An item cannot leave the catalogue while the shop still owns some of it or
                      owes it to a customer. Orders already delivered or cancelled do not hold it
                      back.
                    </p>
                  </>
                ) : (
                  <p>
                    {`"${deleting?.name}" comes out of the catalogue. Nothing is deleted — past orders, stock movements and revenue keep it, and it can be restored at any time.`}
                  </p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {blocked ? 'Close' : 'Cancel'}
            </Button>
            {/* The server refuses this too; the dialog just says so first. */}
            {blocked || checkingRemoval ? null : (
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Remove
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
