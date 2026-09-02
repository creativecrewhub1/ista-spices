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
import { InventoryItemCard } from '@/components/inventory/InventoryItemCard'
import { InventoryItemFormSheet } from '@/components/inventory/InventoryItemFormSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { useInventoryItems, useProducts } from '@/data/queries'
import { useDeleteInventoryItem, useDeleteProduct, useSaveInventoryItem, useSaveProduct } from '@/data/mutations'
import type { InventoryItem, Product } from '@/data/types'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type TabValue = 'raw_material' | 'b2b' | 'product'

type Row = { kind: 'product'; data: Product } | { kind: 'inventory'; data: InventoryItem }

export function InventoryPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<TabValue>('raw_material')

  // Don't fire a request on every keystroke.
  const debouncedQuery = useDebouncedValue(query, 300)
  const search = debouncedQuery || undefined

  // Only the tab in view is fetched; each list is searched server-side.
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts(tab === 'product' ? search : undefined, tab === 'product')
  const {
    data: inventoryItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useInventoryItems({ type: tab, search }, tab !== 'product')

  const saveProduct = useSaveProduct()
  const deleteProduct = useDeleteProduct()
  const saveItem = useSaveInventoryItem()
  const deleteItem = useDeleteInventoryItem()

  const [productFormOpen, setProductFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [itemFormOpen, setItemFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const isLoading = productsLoading || itemsLoading
  const error = productsError ?? itemsError

  // Search and type filtering are applied server-side.
  const filteredRows: Row[] = useMemo(
    () =>
      tab === 'product'
        ? (products ?? []).map((p) => ({ kind: 'product', data: p }))
        : (inventoryItems ?? []).map((i) => ({ kind: 'inventory', data: i })),
    [products, inventoryItems, tab],
  )

  const totalCount = filteredRows.length

  function handleSaveProduct(product: Product) {
    saveProduct.mutate(product)
    setProductFormOpen(false)
    setEditingProduct(null)
  }

  function handleDeleteProductConfirm() {
    if (!deletingProduct) return
    deleteProduct.mutate(deletingProduct.id)
    setDeletingProduct(null)
  }

  function handleSaveItem(item: InventoryItem) {
    saveItem.mutate(item)
    setItemFormOpen(false)
    setEditingItem(null)
  }

  function handleDeleteItemConfirm() {
    if (!deletingItem) return
    deleteItem.mutate(deletingItem.id)
    setDeletingItem(null)
  }

  function handleAdd() {
    if (tab === 'product') {
      setEditingProduct(null)
      setProductFormOpen(true)
    } else {
      setEditingItem(null)
      setItemFormOpen(true)
    }
  }

  const addLabel = tab === 'raw_material' ? 'Add raw material' : tab === 'b2b' ? 'Add B2B item' : 'Add product'
  const tabLabel = tab === 'raw_material' ? 'raw materials' : tab === 'b2b' ? 'B2B items' : 'products'

  return (
    <div className={cn('pb-8', pageEnter)}>
      {/* Counts what's actually listed — only the tab in view is fetched. */}
      <TopBar title="Products & Inventory" subtitle={`${totalCount} ${tabLabel}`} />

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
          <Button onClick={handleAdd} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            {addLabel}
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="raw_material">Raw Material</TabsTrigger>
            <TabsTrigger value="b2b">B2B</TabsTrigger>
            <TabsTrigger value="product">Manufacturing</TabsTrigger>
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
                  onEdit={(p) => {
                    setEditingProduct(p)
                    setProductFormOpen(true)
                  }}
                  onDelete={setDeletingProduct}
                />
              ) : (
                <InventoryItemCard
                  key={row.data.id}
                  item={row.data}
                  onEdit={(i) => {
                    setEditingItem(i)
                    setItemFormOpen(true)
                  }}
                  onDelete={setDeletingItem}
                />
              ),
            )}
          </div>
        )}
      </div>

      <ProductFormSheet
        open={productFormOpen}
        onOpenChange={(open) => {
          setProductFormOpen(open)
          if (!open) setEditingProduct(null)
        }}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <InventoryItemFormSheet
        open={itemFormOpen}
        onOpenChange={(open) => {
          setItemFormOpen(open)
          if (!open) setEditingItem(null)
        }}
        item={editingItem}
        defaultType={tab === 'b2b' ? 'b2b' : 'raw_material'}
        onSave={handleSaveItem}
      />

      <Dialog open={Boolean(deletingProduct)} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove product?</DialogTitle>
            <DialogDescription>
              {deletingProduct
                ? `"${deletingProduct.name}" will be removed from the catalogue. This can't be undone.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingProduct(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProductConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove item?</DialogTitle>
            <DialogDescription>
              {deletingItem ? `"${deletingItem.name}" will be removed from inventory. This can't be undone.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItemConfirm}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
