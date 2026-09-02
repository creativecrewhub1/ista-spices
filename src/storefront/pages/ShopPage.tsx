import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductCard } from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/ProductCardSkeleton'
import { Pagination } from '../components/Pagination'
import { EmptyState } from '../components/EmptyState'
import { PackageSearch } from 'lucide-react'
import { FilterPanel } from '../filters/FilterPanel'
import { SortSelect, type SortValue } from '../filters/SortSelect'
import { defaultFilters, type ShopFilters } from '../filters/types'
import { categories, products } from '../data/products'
import type { ProductCategory } from '../data/types'

const PAGE_SIZE = 8

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') as ProductCategory | null

  const [filters, setFilters] = useState<ShopFilters>({
    ...defaultFilters,
    categories: categoryParam ? [categoryParam] : [],
  })
  const [sort, setSort] = useState<SortValue>('featured')
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (categoryParam && !filters.categories.includes(categoryParam)) {
      setFilters((prev) => ({ ...prev, categories: [categoryParam] }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam])

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timeout)
  }, [filters, sort, page])

  useEffect(() => {
    setPage(1)
  }, [filters, sort])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false
      if (filters.spiceLevels.length > 0 && (!p.spiceLevel || !filters.spiceLevels.includes(p.spiceLevel))) return false
      if (p.variants[0].price > filters.maxPrice) return false
      if (filters.inStockOnly && !p.inStock) return false
      return true
    })

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.variants[0].price - b.variants[0].price)
        break
      case 'price-desc':
        list = [...list].sort((a, b) => b.variants[0].price - a.variants[0].price)
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        list = [...list].sort((a, b) => (b.badges.includes('new') ? 1 : 0) - (a.badges.includes('new') ? 1 : 0))
        break
      default:
        list = [...list].sort((a, b) => (b.badges.includes('bestseller') ? 1 : 0) - (a.badges.includes('bestseller') ? 1 : 0))
    }
    return list
  }, [filters, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const activeCategory = filters.categories.length === 1 ? categories.find((c) => c.id === filters.categories[0]) : null

  function updateFilters(next: ShopFilters) {
    setFilters(next)
    if (next.categories.length === 1) {
      setSearchParams({ category: next.categories[0] })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="band-cream">
      {/* Page header sits on its own white band, matching the alternating
          section rhythm the rest of the storefront uses. */}
      <section className="band-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: activeCategory?.label ?? 'Shop All' }]} />
          <div className="mt-4 flex flex-col gap-2">
            <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
              {activeCategory?.label ?? 'Shop All'}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              {activeCategory?.description ??
                'Every spice powder, oil, and blend we make — small-batch and ground fresh to order.'}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="hidden lg:block">
          <FilterPanel filters={filters} onChange={updateFilters} />
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <SlidersHorizontal className="size-3.5" aria-hidden="true" />
                Filters
              </Button>
              <p className="text-sm text-muted-foreground">{filtered.length} products</p>
            </div>
            <div className="flex items-center gap-2">
              <SortSelect value={sort} onChange={setSort} />
              <ToggleGroup
                type="single"
                value={view}
                onValueChange={(v) => v && setView(v as 'grid' | 'list')}
                className="hidden sm:flex"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" className="size-9">
                  <LayoutGrid className="size-4" aria-hidden="true" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" className="size-9">
                  <List className="size-4" aria-hidden="true" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {isLoading ? (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-4'
              }
            >
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : pageItems.length === 0 ? (
            <EmptyState
              icon={PackageSearch}
              title="No products match your filters"
              description="Try widening your price range or clearing a filter."
              action={
                <Button variant="outline" onClick={() => updateFilters(defaultFilters)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4'
                  : 'flex flex-col gap-4'
              }
            >
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && pageItems.length > 0 ? (
            <div className="mt-10">
              <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          ) : null}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="flex w-[85vw] max-w-sm flex-col">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <FilterPanel filters={filters} onChange={updateFilters} />
          </div>
          <SheetFooter className="border-t border-border">
            <Button className="w-full" onClick={() => setMobileFiltersOpen(false)}>
              Show {filtered.length} results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
