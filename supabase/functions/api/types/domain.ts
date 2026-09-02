// Domain types returned to the frontend. Kept in lockstep with
// src/data/types.ts on the client — the API's job is to hand back
// data shaped exactly like this, so the frontend never has to reshape it.

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
  /** low/ok/high classification of unitsPackedThisBatch vs batchCapacity — a backend decision, not a frontend threshold. */
  stockLevel: StockLevel
  /** Per-unit cost of the most recent consignment — today's buying price. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  isActive: boolean
  /** Display image — app-relative path or absolute URL. Null until a photo exists. */
  imageUrl: string | null
}

/** Where an item came from: made here, or bought in for resale. */
export type ItemOrigin = 'manufactured' | 'purchased'

export type StockMovementKind =
  | 'receipt'
  | 'sale'
  | 'consumption'
  | 'production'
  | 'adjustment'

/** An item's current position, derived from the movement ledger. */
export interface StockItem {
  itemId: string
  name: string
  origin: ItemOrigin
  isSellable: boolean
  isConsumable: boolean
  unit: string
  quantityOnHand: number
  lowStockThreshold: number
  /** Weighted average of what receipts cost. Null when nothing has been
   *  purchased yet: unknown cost, which is not the same as zero cost. */
  avgUnitCost: number | null
  /** Null wherever avgUnitCost is — stock can't be valued without a basis. */
  stockValue: number | null
  isLowStock: boolean
  /** Per-unit cost of the most recent consignment — today's buying price. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  /** Consignment reference of that most recent receipt. */
  lastBatchNo: string | null
}

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  unit: string
  kind: StockMovementKind
  /** Signed: positive brought stock in, negative took it out. */
  qty: number
  unitCost: number | null
  occurredAt: string
  orderId: string | null
  note: string | null
  /** Consignment reference, assigned by the database on receipt. */
  batchNo: string | null
}

export interface StockReceiptInput {
  itemId: string
  qty: number
  /** Purchase cost per unit — not the sale price. */
  unitCost: number
  occurredAt?: string
  note?: string
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
  /** Per-unit cost of the most recent consignment — today's buying price. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
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

/** One recorded status transition, written by a DB trigger on every change. */
export interface OrderStatusEvent {
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedAt: string
}

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
  /** From the customer record — null for customers with no contact on file. */
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

/** Server-side filters for the admin order list — keeps the query indexed
 * instead of shipping every order to the browser to filter in memory. */
export interface OrderListFilters {
  status?: OrderStatus
  /** Matches order id or customer name (trigram-indexed ILIKE). */
  search?: string
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
  lastOrderAt: string | null
  /** Ordered within the last 90 days — computed in customers_with_stats. */
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

/**
 * The four headline figures. Each is a whole-business number read straight
 * from the database, not a rolling window:
 *  - totalRevenue  every non-cancelled order to date
 *  - monthRevenue  non-cancelled orders placed in the current calendar month
 *  - pendingOrders orders awaiting action, all time
 *  - activeOrders  orders being fulfilled (processing, packed or shipped)
 */
export interface DashboardKpis {
  totalRevenue: number
  monthRevenue: number
  pendingOrders: number
  activeOrders: number
}

/** Today's activity only — drives the "Orders today" panel. */
export interface TodaySummary {
  totalOrders: number
  statusCounts: {
    pending: number
    processing: number
    packed: number
    delivered: number
  }
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
