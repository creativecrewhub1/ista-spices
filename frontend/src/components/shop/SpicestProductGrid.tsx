import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SpicestProductCard } from './SpicestProductCard'
import type { CatalogProduct } from '@/data/types'

interface SpicestProductGridProps {
  products?: CatalogProduct[]
}

const FEATURED_COUNT = 4

/** Homepage teaser — the first few sellable products, with a link to the full shop for the rest. */
export function SpicestProductGrid({ products }: SpicestProductGridProps) {
  const featured = (products ?? []).filter((p) => p.packSizes.length > 0).slice(0, FEATURED_COUNT)

  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-16" id="products">
      <div className="pointer-events-none absolute left-2 top-16 w-16 opacity-85 duration-3000 animate-pulse sm:left-8 sm:w-24">
        <img src="/images/spicest/star_anise_float.png" alt="" className="h-auto w-full drop-shadow-md" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl space-y-3 text-center sm:mb-16">
          <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our Best product
          </h2>
          <p className="text-xs leading-relaxed text-gray-500 sm:text-sm">
            Through our love for spices we have been producing and blending spices for you since 1998
          </p>
        </div>

        {featured.length === 0 ? (
          <p className="text-center text-sm text-gray-400">No products are available right now.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
              {featured.map((product) => (
                <SpicestProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/shop/all"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E85D19] hover:text-[#d24e0f]"
              >
                View all products
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
