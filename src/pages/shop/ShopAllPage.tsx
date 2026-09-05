import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { SpicestHeader } from '@/components/shop/SpicestHeader'
import { SpicestFooter } from '@/components/shop/SpicestFooter'
import { SpicestProductCard } from '@/components/shop/SpicestProductCard'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCatalog } from '@/data/queries'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { ProductCategory } from '@/data/types'

type CategoryFilter = 'all' | ProductCategory

/** The actual browsable catalog — every sellable product, filterable by category and search. */
export function ShopAllPage() {
  const { data: products, isLoading } = useCatalog()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [category, setCategory] = useState<CategoryFilter>(
    (searchParams.get('category') as CategoryFilter) || 'all',
  )

  const filtered = useMemo(() => {
    return (products ?? [])
      .filter((p) => p.packSizes.length > 0)
      .filter((p) => category === 'all' || p.category === category)
      .filter((p) => {
        const q = query.trim().toLowerCase()
        if (!q) return true
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      })
  }, [products, category, query])

  return (
    <div className={cn('storefront min-h-svh bg-white font-sans text-gray-900', pageEnter)}>
      <SpicestHeader />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Shop all products
          </h1>
          <p className="text-sm text-gray-500">
            Freshly ground spices and cold-pressed oils, packed to order.
          </p>
        </div>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="spice-powder">Spice Powders</TabsTrigger>
              <TabsTrigger value="cooking-oil">Cooking Oils</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="rounded-full pl-9"
              aria-label="Search products"
            />
          </div>
        </div>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-400">Loading products…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {filtered.map((product) => (
              <SpicestProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <SpicestFooter />
    </div>
  )
}
