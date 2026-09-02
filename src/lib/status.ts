import type {
  CustomerSegment,
  InventoryItemType,
  OrderStatus,
  ProductCategory,
  SpiceLevel,
  StockLevel,
} from '@/data/types'

export type { OrderStatus }

export const orderStatusConfig: Record<
  OrderStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: 'Pending',
    badgeClass: 'bg-warning/15 text-warning border-warning/30',
    dotClass: 'bg-warning',
  },
  processing: {
    label: 'Processing',
    badgeClass: 'bg-accent/15 text-accent border-accent/30',
    dotClass: 'bg-accent',
  },
  packed: {
    label: 'Packed',
    badgeClass: 'bg-primary/15 text-primary border-primary/30',
    dotClass: 'bg-primary',
  },
  shipped: {
    label: 'Shipped',
    badgeClass: 'bg-violet-500/15 text-violet-600 border-violet-500/30',
    dotClass: 'bg-violet-500',
  },
  delivered: {
    label: 'Delivered',
    badgeClass: 'bg-success/15 text-success border-success/30',
    dotClass: 'bg-success',
  },
  cancelled: {
    label: 'Cancelled',
    badgeClass: 'bg-destructive/15 text-destructive border-destructive/30',
    dotClass: 'bg-destructive',
  },
}

export const inventoryItemTypeConfig: Record<InventoryItemType, { label: string; badgeClass: string }> = {
  raw_material: { label: 'Raw Material', badgeClass: 'bg-accent/15 text-accent border-accent/30' },
  b2b: { label: 'B2B', badgeClass: 'bg-violet-500/15 text-violet-600 border-violet-500/30' },
}

export const categoryConfig: Record<ProductCategory, { label: string; badgeClass: string }> = {
  'spice-powder': { label: 'Spice Powder', badgeClass: 'bg-primary/15 text-primary border-primary/30' },
  'cooking-oil': { label: 'Cooking Oil', badgeClass: 'bg-accent/15 text-accent border-accent/30' },
}

export const spiceLevelConfig: Record<SpiceLevel, { label: string; dotClass: string }> = {
  mild: { label: 'Mild', dotClass: 'bg-amber-400' },
  medium: { label: 'Medium', dotClass: 'bg-orange-500' },
  hot: { label: 'Hot', dotClass: 'bg-destructive' },
}

export const segmentConfig: Record<CustomerSegment, { label: string; badgeClass: string }> = {
  new: { label: 'New', badgeClass: 'bg-accent/15 text-accent border-accent/30' },
  regular: { label: 'Regular', badgeClass: 'bg-muted text-muted-foreground border-border' },
  vip: { label: 'VIP', badgeClass: 'bg-primary/15 text-primary border-primary/30' },
}

// Pure display mapping only — the low/ok/high classification itself is computed
// server-side (see Product.stockLevel) so the threshold rule lives in one place.
export const stockLevelConfig: Partial<Record<StockLevel, { label: string; badgeClass: string }>> = {
  low: { label: 'Low stock', badgeClass: 'bg-warning/15 text-warning border-warning/30' },
  high: { label: 'Well stocked', badgeClass: 'bg-success/15 text-success border-success/30' },
}
