import { SpicestHeader } from '@/components/shop/SpicestHeader'
import { SpicestHero } from '@/components/shop/SpicestHero'
import { SpicestCategoryBanners } from '@/components/shop/SpicestCategoryBanners'
import { SpicestProductGrid } from '@/components/shop/SpicestProductGrid'
import { SpicestTestimonials } from '@/components/shop/SpicestTestimonials'
import { SpicestBlogSection } from '@/components/shop/SpicestBlogSection'
import { SpicestNewsletter } from '@/components/shop/SpicestNewsletter'
import { SpicestFooter } from '@/components/shop/SpicestFooter'
import { useCatalog } from '@/data/queries'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** The storefront's marketing homepage — browsing/filtering the full catalog lives on ShopAllPage. */
export function CatalogPage() {
  const { data: products } = useCatalog()

  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={cn('storefront min-h-svh bg-white font-sans text-gray-900', pageEnter)}>
      <SpicestHeader />
      <SpicestHero onBuyNowClick={scrollToProducts} onMoreProductClick={scrollToProducts} />
      <SpicestCategoryBanners />
      <SpicestProductGrid products={products} />
      <SpicestTestimonials />
      <SpicestBlogSection />
      <SpicestNewsletter />
      <SpicestFooter />
    </div>
  )
}
