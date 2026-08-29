import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { CatalogProduct, PackSizeLabel } from '@/data/types'

export interface CartItem {
  productId: string
  productName: string
  packSize: PackSizeLabel
  price: number
  qty: number
}

interface CartContextValue {
  items: CartItem[]
  addItem: (product: CatalogProduct, packSize: PackSizeLabel, qty: number) => void
  updateQty: (productId: string, packSize: PackSizeLabel, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)
const STORAGE_KEY = 'ista-spices-cart'

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// Client-side only, by design — the cart is just UI state until checkout,
// where the whole thing is sent as one request and the server recomputes
// prices from the DB. No cart table, nothing to keep in sync.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(product: CatalogProduct, packSize: PackSizeLabel, qty: number) {
    const price = product.packSizes.find((p) => p.size === packSize)?.price ?? 0
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id && i.packSize === packSize)
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { productId: product.id, productName: product.name, packSize, price, qty }]
    })
  }

  function updateQty(productId: string, packSize: PackSizeLabel, qty: number) {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.productId === productId && i.packSize === packSize))
        : prev.map((i) => (i.productId === productId && i.packSize === packSize ? { ...i, qty } : i)),
    )
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
