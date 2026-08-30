import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Product, ProductAccent, ProductVariant } from '../data/types'

export interface CartLine {
  productId: string
  slug: string
  variantId: string
  name: string
  variantLabel: string
  price: number
  qty: number
  accent: ProductAccent
}

interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotal: number
  isOpen: boolean
  open: () => void
  close: () => void
  addItem: (product: Product, variant: ProductVariant, qty?: number) => void
  updateQty: (productId: string, variantId: string, qty: number) => void
  removeItem: (productId: string, variantId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  function addItem(product: Product, variant: ProductVariant, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id && l.variantId === variant.id)
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id && l.variantId === variant.id ? { ...l, qty: l.qty + qty } : l,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          variantId: variant.id,
          name: product.name,
          variantLabel: variant.label,
          price: variant.price,
          qty,
          accent: product.accent,
        },
      ]
    })
    setIsOpen(true)
  }

  function updateQty(productId: string, variantId: string, qty: number) {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.productId === productId && l.variantId === variantId))
        : prev.map((l) => (l.productId === productId && l.variantId === variantId ? { ...l, qty } : l)),
    )
  }

  function removeItem(productId: string, variantId: string) {
    setLines((prev) => prev.filter((l) => !(l.productId === productId && l.variantId === variantId)))
  }

  const { itemCount, subtotal } = useMemo(
    () => ({
      itemCount: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    }),
    [lines],
  )

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    addItem,
    updateQty,
    removeItem,
    clear: () => setLines([]),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
