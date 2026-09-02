import { supabase } from '../lib/supabaseClient.ts'
import type { StockItem, StockMovement, StockReceiptInput } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapStockRow(row: any): StockItem {
  return {
    itemId: row.item_id,
    name: row.name,
    origin: row.origin,
    isSellable: row.is_sellable,
    isConsumable: row.is_consumable,
    unit: row.unit,
    quantityOnHand: Number(row.quantity_on_hand),
    lowStockThreshold: Number(row.low_stock_threshold),
    // Null means "never purchased, so cost unknown" — distinct from ₹0.
    avgUnitCost: row.avg_unit_cost === null ? null : Number(row.avg_unit_cost),
    stockValue: row.stock_value === null ? null : Number(row.stock_value),
    isLowStock: row.is_low_stock,
    lastPurchaseCost: row.last_purchase_cost === null ? null : Number(row.last_purchase_cost),
    lastPurchasedAt: row.last_purchased_at ?? null,
    lastBatchNo: row.last_batch_no ?? null,
  }
}

/** Current position for every active item — quantity, average cost and value. */
export async function listStock(): Promise<StockItem[]> {
  const { data, error } = await supabase.from('item_stock').select('*').order('name')
  if (error) throw error
  return data.map(mapStockRow)
}

// deno-lint-ignore no-explicit-any
function mapMovementRow(row: any): StockMovement {
  return {
    id: String(row.id),
    itemId: row.item_id,
    itemName: row.products?.name ?? row.item_id,
    unit: row.products?.unit ?? '',
    kind: row.kind,
    qty: Number(row.qty),
    unitCost: row.unit_cost === null ? null : Number(row.unit_cost),
    occurredAt: row.occurred_at,
    orderId: row.order_id,
    note: row.note,
    batchNo: row.batch_no ?? null,
  }
}

/** Movement history, newest first. */
export async function listMovements(itemId?: string, limit = 100): Promise<StockMovement[]> {
  let query = supabase
    .from('stock_movements')
    .select('*, products(name, unit)')
    .order('occurred_at', { ascending: false })
    .limit(limit)

  if (itemId) query = query.eq('item_id', itemId)

  const { data, error } = await query
  if (error) throw error
  return data.map(mapMovementRow)
}

/**
 * Records stock arriving. This is the only place a purchase cost enters
 * the system — every valuation downstream is an average of these rows.
 */
export async function recordReceipt(input: StockReceiptInput): Promise<void> {
  const { error } = await supabase.from('stock_movements').insert({
    item_id: input.itemId,
    kind: 'receipt',
    qty: input.qty,
    unit_cost: input.unitCost,
    occurred_at: input.occurredAt ?? new Date().toISOString(),
    note: input.note ?? null,
  })
  if (error) throw error
}

/** A recount or wastage correction. Signed: negative writes stock off. */
export async function recordAdjustment(input: {
  itemId: string
  qty: number
  note: string
}): Promise<void> {
  const { error } = await supabase.from('stock_movements').insert({
    item_id: input.itemId,
    kind: 'adjustment',
    qty: input.qty,
    note: input.note,
  })
  if (error) throw error
}
