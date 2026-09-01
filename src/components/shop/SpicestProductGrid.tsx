import { useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shop/CartContext'
import type { CatalogProduct, ProductCategory, SpiceLevel } from '@/data/types'

interface SpicestProductGridProps {
  products?: CatalogProduct[]
}

interface DisplayProduct {
  id: string
  name: string
  category: ProductCategory
  description: string
  price: number
  image: string
  unitText: string
  packSizes: { size: '250g' | '500g' | '1kg' | '2kg'; price: number }[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
}

const defaultFeaturedProducts: DisplayProduct[] = [
  {
    id: 'spicest-red-powder',
    name: 'Red Powder',
    category: 'spice-powder',
    description: 'Pure sun-dried Kashmiri chili powder milled to vibrant red perfection.',
    price: 15.88,
    image: '/images/spicest/prod_red_powder.png',
    unitText: 'price er pack of 100g',
    packSizes: [{ size: '250g', price: 15.88 }],
    discountPercent: 0,
    spiceLevel: 'hot'
  },
  {
    id: 'spicest-turmeric-powder',
    name: 'Turmeric Powder',
    category: 'spice-powder',
    description: 'High-curcumin golden turmeric root powder with aromatic earthly fragrance.',
    price: 10.80,
    image: '/images/spicest/prod_turmeric_powder.png',
    unitText: 'price er pack of 100g',
    packSizes: [{ size: '250g', price: 10.80 }],
    discountPercent: 0,
    spiceLevel: 'mild'
  },
  {
    id: 'spicest-paprika-powder',
    name: 'Paprika powder',
    category: 'spice-powder',
    description: 'Fresh herbal paprika & savory garden spice blend for everyday dishes.',
    price: 21.00,
    image: '/images/spicest/prod_paprika_powder.png',
    unitText: 'price er pack of 100g',
    packSizes: [{ size: '250g', price: 21.00 }],
    discountPercent: 0,
    spiceLevel: 'medium'
  },
  {
    id: 'spicest-golden-turmeric',
    name: 'Turmeric powder',
    category: 'spice-powder',
    description: 'Rich golden spice blend for curries, lattes, and roasted vegetables.',
    price: 16.08,
    image: '/images/spicest/prod_golden_turmeric.png',
    unitText: 'price er pack of 100g',
    packSizes: [{ size: '250g', price: 16.08 }],
    discountPercent: 0,
    spiceLevel: 'mild'
  }
]

export function SpicestProductGrid({ products }: SpicestProductGridProps) {
  const { addItem } = useCart()
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({})

  const itemsToDisplay: DisplayProduct[] = (products && products.length > 0)
    ? products.slice(0, 4).map((p, idx) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        price: p.packSizes[0]?.price ?? defaultFeaturedProducts[idx % 4].price,
        image: p.imageUrl || defaultFeaturedProducts[idx % 4].image,
        unitText: 'price er pack of 100g',
        packSizes: p.packSizes.length > 0 ? p.packSizes : defaultFeaturedProducts[idx % 4].packSizes,
        discountPercent: p.discountPercent,
        spiceLevel: p.spiceLevel
      }))
    : defaultFeaturedProducts

  const handleAddToCart = (product: DisplayProduct) => {
    const catalogItem: CatalogProduct = {
      id: product.id,
      name: product.name,
      category: product.category,
      description: product.description,
      packSizes: product.packSizes,
      discountPercent: product.discountPercent,
      spiceLevel: product.spiceLevel,
      imageUrl: product.image
    }

    addItem(catalogItem, '250g', 1)

    setAddedIds((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }))
    }, 1200)
  }

  return (
    <section className="relative py-16 bg-[#FAF8F5] overflow-hidden" id="products">
      
      {/* Floating Star Anise Background Element (Matching 3rd reference image) */}
      <div className="absolute left-2 sm:left-8 top-16 w-16 sm:w-24 opacity-85 pointer-events-none animate-pulse duration-3000">
        <img src="/images/spicest/star_anise_float.png" alt="" className="w-full h-auto drop-shadow-md" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Our Best product
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Through our love for spices we have been producing and blending spices for you since 1998
          </p>
        </div>

        {/* 4 Cards Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {itemsToDisplay.map((item) => {
            const isAdded = addedIds[item.id]
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 text-center"
              >
                {/* Product Image Bowl */}
                <div className="h-44 sm:h-48 w-full flex items-center justify-center p-2 mb-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
                  />
                </div>

                {/* Info & Pricing */}
                <div className="space-y-2 flex-1 flex flex-col justify-end">
                  <h3 className="font-display text-lg font-bold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {item.unitText}
                  </p>
                  <p className="text-base sm:text-lg font-extrabold text-gray-900 py-1">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-4">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className={`w-full rounded-full py-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 ${
                      isAdded
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#E85D19] hover:bg-[#d24e0f] text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isAdded ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Check className="size-4" /> Added to Cart
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        <ShoppingBag className="size-4" /> Add to cart
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
