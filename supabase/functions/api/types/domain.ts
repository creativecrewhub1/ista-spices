// Domain types returned to the frontend. Kept in lockstep with
// src/data/types.ts on the client — the API's job is to hand back
// data shaped exactly like this, so the frontend never has to reshape it.

export type ProductCategory = 'spice-powder' | 'cooking-oil'
export type PackSizeLabel = '250g' | '500g' | '1kg' | '2kg'

export interface PackSize {
  size: PackSizeLabel
  price: number
}

export type StockState = 'processing' | 'packing' | 'ready'
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
  stockState: StockState
  /** low/ok/high classification of unitsPackedThisBatch vs batchCapacity — a backend decision, not a frontend threshold. */
  stockLevel: StockLevel
  isActive: boolean
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
  packSize: PackSizeLabel
  qty: number
  price: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
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
  initials: string
  address: string
  joinedAt: string
  planStatus: PlanStatus
  segment: CustomerSegment
  totalOrders: number
  totalSpend: number
  lastOrderAt: string
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

export interface NeedsAttentionResponse {
  items: AttentionItem[]
}
