import { useState, useMemo } from 'react'
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

export function CatalogPage() {
  const { data: products } = useCatalog()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filteredProducts = useMemo(() => {
    if (!products) return undefined
    return products.filter((p) => {
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCat = selectedCategory === 'all' || 
        (selectedCategory === 'blends' ? p.category === 'spice-powder' : p.category === selectedCategory)
      
      return matchesSearch && matchesCat
    })
  }, [products, searchQuery, selectedCategory])

  const scrollToProducts = () => {
    const el = document.getElementById('products')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={cn('storefront min-h-svh bg-white font-sans text-gray-900', pageEnter)}>
      {/* 1. Header Navbar */}
      <SpicestHeader 
        onSearchChange={setSearchQuery} 
        activeCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* 2. Hero Section */}
      <SpicestHero 
        onBuyNowClick={scrollToProducts}
        onMoreProductClick={scrollToProducts}
      />

      {/* 3. Category Feature Banners */}
      <SpicestCategoryBanners 
        onCategoryClick={(cat) => {
          setSelectedCategory(cat)
          scrollToProducts()
        }}
      />

      {/* 4. "Our Best product" Grid */}
      <SpicestProductGrid products={filteredProducts} />

      {/* 5. Customer Testimonials */}
      <SpicestTestimonials />

      {/* 6. Blog Section */}
      <SpicestBlogSection />

      {/* 7. Newsletter Subscription Banner */}
      <SpicestNewsletter />

      {/* 8. Footer */}
      <SpicestFooter />
    </div>
  )
}
