import { supabase } from '../lib/supabaseClient.ts'
import type { InventoryItem } from '../types/domain.ts'

/**
 * Raw materials and B2B goods are rows in `products` distinguished by their
 * capabilities, not a separate table:
 *   raw material — production consumes it
 *   b2b          — bought in, sold on as-is
 *
 * Quantity is never read from a column. It is the balance of the movement
 * ledger (see the item_stock view), so a stock-in shows up here and on the
 * Stock screen as the same number.
 */
function typeOf(row: { is_consumable: boolean }): InventoryItem['type'] {
  return row.is_consumable ? 'raw_material' : 'b2b'
}

export interface LedgerPosition {
  quantityOnHand: number
  lastPurchaseCost: number | null
  lastPurchasedAt: string | null
}

const EMPTY_POSITION: LedgerPosition = {
  quantityOnHand: 0,
  lastPurchaseCost: null,
  lastPurchasedAt: null,
}

// deno-lint-ignore no-explicit-any
function mapRow(row: any, position: LedgerPosition): InventoryItem {
  return {
    id: row.id,
    type: typeOf(row),
    name: row.name,
    description: row.description ?? '',
    unit: row.unit,
    quantityOnHand: position.quantityOnHand,
    lowStockThreshold: Number(row.low_stock_threshold),
    lastPurchaseCost: position.lastPurchaseCost,
    lastPurchasedAt: position.lastPurchasedAt,
    isActive: row.is_active,
    imageUrl: row.image_url ?? null,
  }
}

/** item_id → its position in the ledger: quantity, and what it last cost. */
export async function positionByItem(): Promise<Map<string, LedgerPosition>> {
  const { data, error } = await supabase
    .from('item_stock')
    .select('item_id, quantity_on_hand, last_purchase_cost, last_purchased_at')
  if (error) throw error

  return new Map(
    // deno-lint-ignore no-explicit-any
    (data as any[]).map((r) => [
      r.item_id,
      {
        quantityOnHand: Number(r.quantity_on_hand),
        lastPurchaseCost: r.last_purchase_cost === null ? null : Number(r.last_purchase_cost),
        lastPurchasedAt: r.last_purchased_at ?? null,
      },
    ]),
  )
}

export async function listActive(
  filters: { type?: string; search?: string } = {},
): Promise<InventoryItem[]> {
  // Bought-in stock only: manufactured goods are the Products tab.
  let query = supabase.from('products').select('*').eq('is_active', true).eq('origin', 'purchased')

  if (filters.type === 'raw_material') query = query.eq('is_consumable', true)
  if (filters.type === 'b2b') query = query.eq('is_consumable', false)
  if (filters.search) query = query.ilike('name', `%${filters.search}%`)

  const [{ data, error }, positions] = await Promise.all([query.order('name'), positionByItem()])
  if (error) throw error
  return data.map((row) => mapRow(row, positions.get(row.id) ?? EMPTY_POSITION))
}

/**
 * Saves an item's details. Quantity is deliberately not written: on-hand is
 * the sum of the ledger, so overwriting it here would put the two screens
 * back out of step. Stock moves through Stock In and adjustments.
 */
export async function upsert(item: InventoryItem): Promise<void> {
  const { error } = await supabase.from('products').upsert({
    id: item.id,
    name: item.name,
    description: item.description,
    unit: item.unit,
    low_stock_threshold: item.lowStockThreshold,
    is_active: item.isActive,
    image_url: item.imageUrl,
    origin: 'purchased',
    is_consumable: item.type === 'raw_material',
    is_sellable: item.type === 'b2b',
    discount_percent: 0,
  })
  if (error) throw error
}

export async function softDelete(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) throw error
}
