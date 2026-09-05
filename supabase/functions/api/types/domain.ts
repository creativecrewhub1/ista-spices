// Domain types returned to the frontend. Kept in lockstep with
// src/data/types.ts on the client — the API's job is to hand back
// data shaped exactly like this, so the frontend never has to reshape it.

export type ProductCategory = 'spice-powder' | 'cooking-oil'
/**
 * Whether an item can leave the catalogue, and what is holding it there.
 * The dialog asks for this rather than working it out from a list row, so
 * what it shows and what the service enforces cannot drift apart.
 */
export interface ItemRemovalCheck {
  canRemove: boolean
  quantityOnHand: number
  stockUnit: string
  /** Orders still owed to a customer. Delivered and cancelled ones do not count. */
  openOrders: number
}

/** One field's before and after, as recorded by the audit trigger. */
export interface AuditChange {
  field: string
  from: unknown
  to: unknown
}

/** One recorded change to an item. Written by a trigger, never by hand. */
export interface AuditEntry {
  id: number
  version: number
  action: 'created' | 'updated' | 'removed' | 'restored'
  changedAt: string
  changedBy: string | null
  changes: AuditChange[]
}

/** An item taken out of the catalogue, and what it left behind. */
export interface RemovedItem {
  id: string
  name: string
  category: ItemCategory
  removedAt: string
  removedBy: string | null
  /** Still in the ledger, hidden from Stock until the item comes back. */
  quantityOnHand: number
  stockUnit: string
  /** Past orders that keep referring to it. */
  orderLines: number
}

/** An existing item's name, for warning about duplicates as one is typed. */
export interface ItemName {
  id: string
  name: string
  category: ItemCategory
}

/**
 * A pack is a quantity of the item's own selling unit, so the same shape
 * describes 250 ml of oil and 250 g of powder. The label a customer reads is
 * derived from this and the item's sales unit, never stored.
 */
export interface PackSize {
  qty: number
  price: number
  /**
   * What to call this quantity — a piece, a pack, a box. Optional: without
   * it the quantity speaks for itself ("250 ml"). The quantity is always in
   * the item's sales unit, so naming it changes the label, never the maths.
   */
  packaging: string | null
}

export type SpiceLevel = 'mild' | 'medium' | 'hot'
export type StockLevel = 'low' | 'ok' | 'high'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  /** The unit stock is counted in — what unitsPackedThisBatch is measured in. */
  stockUnit: string
  /** The unit pack quantities are expressed in. */
  salesUnit: string
  packSizes: PackSize[]
  discountPercent: number
  spiceLevel: SpiceLevel | null
  /** At or below this, the item counts as running low. */
  lowStockThreshold: number
  /** How much is on hand, in stockUnit. */
  unitsPackedThisBatch: number
  /** low/ok/high, computed server-side against lowStockThreshold. */
  stockLevel: StockLevel
  /** Per-unit cost of the most recent lot, bought or made. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  /** The lot it came from. MNF- numbers were produced, BN- were bought. */
  lastBatchNo: string | null
  lastBatchKind: 'receipt' | 'production' | null
  isActive: boolean
  /** Display image — app-relative path or absolute URL. Null until a photo exists. */
  imageUrl: string | null
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

/**
 * The category an admin picks when adding stock. Maps onto origin and the
 * two capability flags in items.repo — one translation, one place.
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
}

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
  /** Per-unit cost of the most recent lot, bought or made. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  /** The lot it came from. MNF- numbers were produced, BN- were bought. */
  lastBatchNo: string | null
  lastBatchKind: 'receipt' | 'production' | null
}

export interface StockMovement {
  id: string
  itemId: string
  itemName: string
  stockUnit: string
  kind: StockMovementKind
  /** Signed: positive brought stock in, negative took it out. */
  qty: number
  /** What the consignment cost in total — the figure on the invoice. */
  totalCost: number | null
  /** Derived by the database from totalCost and qty; never written. */
  unitCost: number | null
  occurredAt: string
  orderId: string | null
  note: string | null
  /** Consignment reference, assigned by the database on receipt. */
  batchNo: string | null
}

/** One material that went into a batch, and how much of it. */
export interface ProductionInputLine {
  itemId: string
  qty: number
}

/** What a batch consumed and what it yielded. */
export interface ProductionRunInput {
  productId: string
  outputQty: number
  inputs: ProductionInputLine[]
  occurredAt?: string
  note?: string
}

/** One batch of stock still available to draw from, oldest first. */
export interface StockLayer {
  movementId: string
  batchNo: string | null
  occurredAt: string
  remainingQty: number
  unitCost: number | null
}

/**
 * What a batch costs, material by material and batch by batch. Produced by
 * walking each material's layers oldest first — the same rule the database
 * applies when the run is posted.
 */
export interface ProductionCosting {
  materials: {
    itemId: string
    itemName: string
    unit: string
    qty: number
    /** Quantity no costed batch could cover, if any. */
    uncovered: number
    drawnFrom: {
      batchNo: string | null
      arrivedAt: string
      qty: number
      unitCost: number | null
      lineCost: number
    }[]
    materialCost: number
  }[]
  totalCost: number
  outputQty: number
  costPerOutputUnit: number | null
}

/** A posted run, as it reads back. */
export interface ProductionRun {
  id: string
  productName: string
  outputQty: number
  outputUnit: string
  occurredAt: string
  note: string | null
  inputs: { itemName: string; qty: number; unit: string }[]
}

export interface StockReceiptInput {
  itemId: string
  qty: number
  /**
   * What the whole consignment cost, not a rate. It is the figure on the
   * supplier's invoice, so it is what gets recorded; the per-unit cost is
   * worked out from it rather than the other way round.
   */
  totalCost: number
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
  /** What it resells for. Empty for raw materials, which are not sold. */
  packSizes: PackSize[]
  quantityOnHand: number
  lowStockThreshold: number
  /** Per-unit cost of the most recent lot, bought or made. */
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
  /** The lot it came from. MNF- numbers were produced, BN- were bought. */
  lastBatchNo: string | null
  lastBatchKind: 'receipt' | 'production' | null
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
  /** Null until the customer provides one — Google signup doesn't supply it. */
  phone: string | null
  email: string | null
  initials: string
  /** Null until the customer provides one — Google signup doesn't supply it. */
  address: string | null
  joinedAt: string
  planStatus: PlanStatus
  segment: CustomerSegment
  totalOrders: number
  totalSpend: number
  lastOrderAt: string | null
  /** Ordered within the last 90 days — computed in customers_with_stats. */
  isActive: boolean
  createdAt: string
  updatedAt: string
  /** Google's photo at signup, or a URL the customer pasted in on their profile. */
  avatarUrl: string | null
}

/** Fields a customer can edit on their own profile — all optional, only provided fields change. */
export interface UpdateProfileInput {
  name?: string
  phone?: string
  address?: string
  avatarUrl?: string
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
      /** What unitsInHand is measured in. */
      stockUnit: string
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
