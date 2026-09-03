import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
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
import { useInventoryItems, useItem, useProducts } from '@/data/queries'
import { useDeleteItem, useSaveItem } from '@/data/mutations'
import type { InventoryItem, ItemCategory, ItemInput, Product } from '@/data/types'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
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

  // Only the tab in view is fetched; each list is searched server-side.
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(isManufacturingTab ? search : undefined, isManufacturingTab)
  const {
    data: inventoryItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useInventoryItems({ type: tab, search }, !isManufacturingTab)

  const saveItem = useSaveItem()
  const deleteItem = useDeleteItem()

  const [formOpen, setFormOpen] = useState(false)
  // The id only. The form is loaded from the API so nothing editable is
  // reconstructed from a list row and then saved back as a guess.
  const [editingId, setEditingId] = useState<string | null>(null)
  const { data: editing = null } = useItem(editingId)
  // Loaded means "this item", not merely "not fetching" — the previous item's
  // data is kept as placeholder while the next one is in flight.
  const editLoading = Boolean(editingId) && editing?.id !== editingId
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)

  const isLoading = productsLoading || itemsLoading
  const error = productsError ?? itemsError

  // Search and category filtering are applied server-side.
  const filteredRows: Row[] = useMemo(
    () =>
      isManufacturingTab
        ? (products ?? []).map((p) => ({ kind: 'product' as const, data: p }))
        : (inventoryItems ?? []).map((i) => ({ kind: 'inventory' as const, data: i })),
    [products, inventoryItems, isManufacturingTab],
  )

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

  function handleDeleteConfirm() {
    if (!deleting) return
    deleteItem.mutate(deleting.id)
    setDeleting(null)
  }

  return (
    <div className={cn('pb-8', pageEnter)}>
      {/* Counts what's actually listed — only the tab in view is fetched. */}
      <TopBar
        title="Products & Inventory"
        subtitle={`${filteredRows.length} ${TAB_LABELS[tab]}`}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory..."
              className="pl-9"
              aria-label="Search inventory"
            />
          </div>
          {/* One way in, whatever the tab — the category is chosen in the form. */}
          <Button onClick={openAdd} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Add item
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ItemCategory)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="raw_material">Raw Material</TabsTrigger>
            <TabsTrigger value="b2b">B2B</TabsTrigger>
            <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <CardListSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : filteredRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No items match your search.</p>
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

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove item?</DialogTitle>
            <DialogDescription>
              {deleting
                ? `"${deleting.name}" will be removed from the catalogue. Past orders keep it.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
