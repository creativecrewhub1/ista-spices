import { createContext, useContext, useState, type ReactNode } from 'react'

interface WishlistContextValue {
  ids: Set<string>
  has: (productId: string) => boolean
  toggle: (productId: string) => void
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set(['p-1', 'p-9']))

  function toggle(productId: string) {
    setIds((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  return (
    <WishlistContext.Provider value={{ ids, has: (id) => ids.has(id), toggle }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within a WishlistProvider')
  return ctx
}
