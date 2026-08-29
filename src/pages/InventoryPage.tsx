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
import { ProductFormSheet } from '@/components/inventory/ProductFormSheet'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { useProducts } from '@/data/queries'
import { useDeleteProduct, useSaveProduct } from '@/data/mutations'
import type { Product, StockState } from '@/data/types'

type FilterValue = 'all' | StockState

export function InventoryPage() {
  const { data: items, isLoading, error } = useProducts()
  const saveProduct = useSaveProduct()
  const deleteProduct = useDeleteProduct()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Product | null>(null)
  const [deletingItem, setDeletingItem] = useState<Product | null>(null)

  const filteredItems = useMemo(() => {
    return (items ?? []).filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'all' || item.stockState === filter
      return matchesQuery && matchesFilter
    })
  }, [items, query, filter])

  function handleSave(item: Product) {
    saveProduct.mutate(item)
    setFormOpen(false)
    setEditingItem(null)
  }

  function handleDeleteConfirm() {
    if (!deletingItem) return
    deleteProduct.mutate(deletingItem.id)
    setDeletingItem(null)
  }

  return (
    <div className="pb-8">
      <TopBar
        title="Products & Inventory"
        subtitle={`${items?.length ?? 0} products in the catalogue`}
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search spices & oils..."
              className="pl-9"
              aria-label="Search products"
            />
          </div>
          <Button
            onClick={() => {
              setEditingItem(null)
              setFormOpen(true)
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Button>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="packing">Packing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <LoadingState label="Loading products…" />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : filteredItems.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onEdit={(i) => {
                  setEditingItem(i)
                  setFormOpen(true)
                }}
                onDelete={setDeletingItem}
              />
            ))}
          </div>
        )}
      </div>

      <ProductFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditingItem(null)
        }}
        product={editingItem}
        onSave={handleSave}
      />

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove product?</DialogTitle>
            <DialogDescription>
              {deletingItem
                ? `"${deletingItem.name}" will be removed from the catalogue. This can't be undone.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
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
