import { useState } from 'react'
import { Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shop/CartContext'
import { useUnits } from '@/data/queries'
import { formatCurrency } from '@/lib/format'
import { formatPack } from '@/lib/packLabel'
import { productImage } from '@/lib/productImage'
import type { CatalogProduct } from '@/data/types'

interface SpicestProductCardProps {
  product: CatalogProduct
}

/** One product tile — used on both the homepage's featured strip and the full shop page. */
export function SpicestProductCard({ product }: SpicestProductCardProps) {
  const { addItem } = useCart()
  const { data: units = [] } = useUnits()
  const [added, setAdded] = useState(false)

  const basePack = product.packSizes[0]
  if (!basePack) return null // no sellable pack — nothing to show or add

  function handleAddToCart() {
    addItem(product, basePack.qty, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-xl">
      <div className="mb-4 flex h-44 w-full items-center justify-center p-2 sm:h-48">
        <img
          src={productImage(product.imageUrl)}
          alt={product.name}
          className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col justify-end space-y-2">
        <h3 className="font-display text-lg font-bold text-gray-900">{product.name}</h3>
        <p className="text-xs text-gray-400">
          price per pack of {formatPack(basePack.qty, product.salesUnit, units)}
        </p>
        <p className="py-1 text-base font-extrabold text-gray-900 sm:text-lg">
          {formatCurrency(basePack.price)}
        </p>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleAddToCart}
          className={`w-full rounded-full py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm ${
            added
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-[#E85D19] text-white shadow-sm hover:bg-[#d24e0f] hover:shadow-md'
          }`}
        >
          {added ? (
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
}
