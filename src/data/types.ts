export type ProductCategory = 'spice-powder' | 'cooking-oil'

export type PackSizeLabel = '250g' | '500g' | '1kg' | '2kg'

export interface PackSize {
  size: PackSizeLabel
  price: number
}

export type StockState = 'processing' | 'packing' | 'ready'

export type SpiceLevel = 'mild' | 'medium' | 'hot'

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
