export type ProductCategory = 'spice-powder' | 'cooking-oil'

/**
 * A pack is a quantity of the item's own selling unit, so the same shape
 * describes 250 ml of oil and 250 g of powder. The label a person reads is
 * derived from this and the sales unit by formatPack — never stored.
 */
export interface PackSize {
  qty: number
  price: number
}

export type SpiceLevel = 'mild' | 'medium' | 'hot'

export type StockLevel = 'low' | 'ok' | 'high'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  /** The unit pack quantities are expressed in. */
  salesUnit: string
  packSizes: PackSize[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
  batchCapacity: number
  unitsPackedThisBatch: number
  /** low/ok/high classification, computed server-side from unitsPackedThisBatch vs batchCapacity. */
  stockLevel: StockLevel
  /** Per-unit cost of the most recent consignment — today's buying price. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  isActive: boolean
  /** Display image — app-relative path or absolute URL. Null until a photo exists. */
  imageUrl: string | null
}

/**
 * The category an admin picks when adding stock. Maps onto origin and the
 * two capability flags server-side — one translation, one place.
 */
export type ItemCategory = 'raw_material' | 'b2b' | 'manufacturing'

/** Everything the one Add/Edit form can submit, whatever the category. */
export interface ItemInput {
  id: string
  category: ItemCategory
  name: string
  description: string
  /** The unit stock is bought and counted in — what the ledger holds. */
  stockUnit: string
  /** The unit it is sold in. Null when nothing sells it. */
  salesUnit: string | null
  /** Stock units consumed by one sales unit: 1 litre of oil = 0.92 kg. */
  salesToStockFactor: number
  lowStockThreshold: number
  imageUrl: string | null
  /** Manufacturing only — ignored for bought-in stock. */
  productCategory: ProductCategory
  spiceLevel: SpiceLevel | null
  packSizes: PackSize[]
  discountPercent: number
  batchCapacity: number
}


/**
 * A unit the shop measures in. Dimension decides whether a conversion is
 * arithmetic (kg to g) or a business fact only the shop knows (kg to litres).
 */
export interface UnitOfMeasure {
  code: string
  name: string
  dimension: 'weight' | 'volume' | 'count'
  /** How many of the dimension base unit this is: 1 kg = 1000 g. */
  baseFactor: number
}
/** A category the item form offers. Labels live with the table the
 *  generated item_category column references. */
export interface ItemCategoryOption {
  code: ItemCategory
  label: string
  hint: string
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
  stockUnit: string
  salesUnit: string | null
  salesToStockFactor: number
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
  stockUnit: string
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
  stockUnit: string
  salesUnit: string | null
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

export interface OrderLineItem {
  productId: string
  name: string
  /** The product's real photo — never guessed from its name. */
  imageUrl: string | null
  /** What was sold, snapshotted: the catalogue may have moved on since. */
  packQty: number
  packUnit: string
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

/** Public storefront catalog row — no batch/production internals, customers don't need them. */
export interface CatalogProduct {
  id: string
  name: string
  category: ProductCategory
  description: string
  salesUnit: string
  packSizes: PackSize[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
  imageUrl: string | null
}

export interface CheckoutItemInput {
  productId: string
  packQty: number
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
