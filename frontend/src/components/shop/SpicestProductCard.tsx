import { Minus, Plus, ShoppingBag } from 'lucide-react'
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
  const { items, addItem, updateQty } = useCart()
  const { data: units = [] } = useUnits()

  const basePack = product.packSizes[0]
  if (!basePack) return null // no sellable pack — nothing to show or add

  const quantity = items.find((item) => item.productId === product.id && item.packQty === basePack.qty)?.qty ?? 0

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
        {quantity > 0 ? (
          <div className="flex h-10 w-full items-center justify-between rounded-full bg-[#E85D19] px-1 text-white shadow-sm" role="group" aria-label={`${product.name} quantity`}>
            <button type="button" onClick={() => updateQty(product.id, basePack.qty, quantity - 1)} aria-label={`Decrease ${product.name} quantity`} className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85D19]"><Minus className="size-4" aria-hidden="true" /></button>
            <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
            <button type="button" onClick={() => updateQty(product.id, basePack.qty, quantity + 1)} aria-label={`Increase ${product.name} quantity`} className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85D19]"><Plus className="size-4" aria-hidden="true" /></button>
          </div>
        ) : (
          <Button onClick={() => addItem(product, basePack.qty, 1)} className="w-full rounded-full bg-[#E85D19] py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#d24e0f] hover:shadow-md sm:text-sm">
            <ShoppingBag className="size-4" aria-hidden="true" /> Add to cart
          </Button>
        )}
      </div>
    </div>
  )
}
