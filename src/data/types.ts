export type ProductCategory = 'spice-powder' | 'cooking-oil'

export type PackSizeLabel = '250g' | '500g' | '1kg' | '2kg'

export interface PackSize {
  size: PackSizeLabel
  price: number
}

export type SpiceLevel = 'mild' | 'medium' | 'hot'

export type StockLevel = 'low' | 'ok' | 'high'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  packSizes: PackSize[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
  batchCapacity: number
  unitsPackedThisBatch: number
  /** low/ok/high classification, computed server-side from unitsPackedThisBatch vs batchCapacity. */
  stockLevel: StockLevel
  isActive: boolean
  /** Display image — app-relative path or absolute URL. Null until a photo exists. */
  imageUrl: string | null
}

/** Raw materials (chilli, coriander seeds, cumin…) and B2B goods (soaps,
 * honey…) — simple quantity-on-hand tracking, no pack-size/pricing tiers. */
export type InventoryItemType = 'raw_material' | 'b2b'

export interface InventoryItem {
  id: string
  type: InventoryItemType
  name: string
  description: string
  unit: string
  quantityOnHand: number
  lowStockThreshold: number
  isActive: boolean
  /** Display image — app-relative path or absolute URL. Null until a photo exists. */
  imageUrl: string | null
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type OrderKind = 'subscription' | 'one_time'

export interface OrderLineItem {
  productId: string
  name: string
  /** The product's real photo — never guessed from its name. */
  imageUrl: string | null
  packSize: PackSizeLabel
  qty: number
  price: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  /** From the customer record — null when no contact is on file. */
  customerPhone: string | null
  /** Captured at storefront checkout; null for admin-created walk-in customers. */
  customerEmail: string | null
  items: OrderLineItem[]
  total: number
  status: OrderStatus
  kind: OrderKind
  placedAt: string
  packedDate: string
  eta: string
  deliveredAt: string | null
  address: string
}

export type CustomerSegment = 'new' | 'regular' | 'vip'
export type PlanStatus = 'active' | 'paused' | 'none'

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  initials: string
  address: string
  joinedAt: string
  planStatus: PlanStatus
  segment: CustomerSegment
  totalOrders: number
  totalSpend: number
  /** Null when they have never ordered. */
  lastOrderAt: string | null
  /** Ordered within the last 90 days — computed server-side. */
  isActive: boolean
}

export interface CustomerCounts {
  total: number
  active: number
  inactive: number
  new: number
  regular: number
  vip: number
}

/** One recorded status transition, written by a DB trigger on every change. */
export interface OrderStatusEvent {
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedAt: string
}

export interface RevenuePoint {
  label: string
  revenue: number
}

export interface RevenueSummary {
  total: number
  monthly: number
  monthlyDelta: number | undefined
  weekly: number
  weeklyDelta: number | undefined
}

export interface ProductRevenueRow {
  id: string
  name: string
  revenue: number
  unitsSold: number
}

export interface TodaySummary {
  totalOrders: number
  statusCounts: {
    pending: number
    processing: number
    packed: number
    delivered: number
  }
  pendingCount: number
  avgOrderValue: number
}

/** Public storefront catalog row — no batch/production internals, customers don't need them. */
export interface CatalogProduct {
  id: string
  name: string
  category: ProductCategory
  description: string
  packSizes: PackSize[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
  imageUrl: string | null
}

export interface CheckoutItemInput {
  productId: string
  packSize: PackSizeLabel
  qty: number
}

export interface CheckoutInput {
  items: CheckoutItemInput[]
  address: string
  name?: string
  phone?: string
}

export type AttentionItem =
  | {
      id: string
      kind: 'low-stock'
      linkTo: '/inventory'
      productName: string
      unitsInHand: number
      batchCapacity: number
    }
  | {
      id: string
      kind: 'late-order'
      linkTo: '/orders'
      orderId: string
      customerName: string
      eta: string
    }
