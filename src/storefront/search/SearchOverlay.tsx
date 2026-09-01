import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Search, SearchX, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ProductVisual } from '../components/ProductVisual'
import { productImage } from '../data/images'
import { PriceTag } from '../components/PriceTag'
import { products } from '../data/products'
import { useSearch } from './SearchContext'

const POPULAR_SEARCHES = ['Turmeric', 'Garam Masala', 'Cold-Pressed Oil', 'Gift Set', 'Chilli Powder']

export function SearchOverlay() {
  const { isOpen, close } = useSearch()
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>(['Coconut Oil', 'Sambar Powder'])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      return
    }
  }, [isOpen])

  useEffect(() => {
    if (!query) {
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    const timeout = setTimeout(() => setIsSearching(false), 350)
    return () => clearTimeout(timeout)
  }, [query])

  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tagline.toLowerCase().includes(query.toLowerCase()) ||
          p.category.includes(query.toLowerCase()),
      )
    : []

  function runSearch(term: string) {
    setQuery(term)
    setRecent((prev) => [term, ...prev.filter((t) => t !== term)].slice(0, 5))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-1/2 h-auto max-h-[85vh] w-full max-w-none -translate-x-1/2 translate-y-0 gap-0 overflow-hidden rounded-none border-b border-border p-0 sm:max-w-none"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>

        <div className="mx-auto flex w-full max-w-2xl flex-col gap-0 px-4 py-5 sm:px-0">
          <div className="flex items-center gap-3">
            <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for spices, oils, gift sets..."
              className="h-11 border-none px-0 text-base shadow-none focus-visible:ring-0"
              aria-label="Search products"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            {!query ? (
              <div className="flex flex-col gap-6">
                {recent.length > 0 ? (
                  <div>
                    <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Recent searches
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => runSearch(term)}
                          className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Popular searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => runSearch(term)}
                        className="rounded-full bg-muted px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-border"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <SearchX className="size-6 text-muted-foreground" aria-hidden="true" />
                <p className="font-display text-lg text-foreground">No results for “{query}”</p>
                <p className="text-sm text-muted-foreground">
                  Try a different term, or browse our full collection.
                </p>
                <Link
                  to="/shop"
                  onClick={close}
                  className="mt-1 text-sm font-medium text-accent hover:underline"
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={close}
                      className="flex items-center gap-3.5 py-3 transition-colors hover:bg-muted/60"
                    >
                      <ProductVisual accent={product.accent} src={productImage(product.slug)} alt={product.name} fit="contain" backdrop={productImage(product.slug) ? 'sand' : 'accent'} className="size-14 shrink-0 rounded-xl" iconClassName="size-5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{product.tagline}</p>
                      </div>
                      {product.badges[0] ? (
                        <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                          {product.badges[0]}
                        </Badge>
                      ) : null}
                      <PriceTag price={product.variants[0].price} size="sm" className="shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
