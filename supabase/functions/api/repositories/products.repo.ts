import { supabase } from '../lib/supabaseClient.ts'
import type { CatalogProduct, Product, StockLevel } from '../types/domain.ts'
import { positionByItem, type LedgerPosition } from './inventoryItems.repo.ts'

/** Smallest pack first — the order a shopper expects to read them in. */
// deno-lint-ignore no-explicit-any
const byQty = (a: any, b: any) => Number(a.pack_qty) - Number(b.pack_qty)

/**
 * Judged against the item's own low-stock threshold, the same figure the
 * bought-in items are judged by. At or below it is low; comfortably clear of
 * it is well stocked.
 */
export function classifyStockLevel(onHand: number, lowStockThreshold: number): StockLevel {
  if (onHand <= lowStockThreshold) return 'low'
  // A threshold of zero means none was set, so nothing can be called low.
  if (lowStockThreshold <= 0) return 'ok'
  return onHand >= lowStockThreshold * 3 ? 'high' : 'ok'
}

/**
 * Units in hand come from the movement ledger, never from a column — the
 * same balance the Stock screen shows. `units_packed_this_batch` survives
 * only as the pre-ledger seed and is no longer read.
 */
// deno-lint-ignore no-explicit-any
function mapRow(row: any, position: LedgerPosition): Product {
  const quantityOnHand = position.quantityOnHand
  const packSizes = [...row.product_pack_sizes]
    .sort(byQty)
    // deno-lint-ignore no-explicit-any
    .map((p: any) => ({ qty: Number(p.pack_qty), price: Number(p.price), packaging: p.packaging ?? null }))

  const lowStockThreshold = Number(row.low_stock_threshold ?? 0)

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    stockUnit: row.stock_unit,
    salesUnit: row.sales_unit,
    packSizes,
    discountPercent: row.discount_percent,
    spiceLevel: row.spice_level,
    lowStockThreshold,
    unitsPackedThisBatch: quantityOnHand,
    stockLevel: classifyStockLevel(quantityOnHand, lowStockThreshold),
    lastPurchaseCost: position.lastPurchaseCost,
    lastPurchasedAt: position.lastPurchasedAt,
    lastBatchNo: position.lastBatchNo,
    lastBatchKind: position.lastBatchKind,
    isActive: row.is_active,
    imageUrl: row.image_url ?? null,
  }
}

/** Goods the shop makes — the Manufacturing tab and the storefront catalogue. */
export async function listActive(search?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*, product_pack_sizes(*)')
    .eq('is_active', true)
    .eq('item_category', 'manufacturing')
  if (search) query = query.ilike('name', `%${search}%`)

  const [{ data, error }, positions] = await Promise.all([query.order('name'), positionByItem()])
  if (error) throw error
  return data.map((row) => mapRow(row, positions.get(row.id) ?? {
      quantityOnHand: 0,
      lastPurchaseCost: null,
      lastPurchasedAt: null,
      lastBatchNo: null,
      lastBatchKind: null,
    }))
}



/**
 * Public storefront read — active products only, and only the fields a
 * customer needs to shop — no stock levels or costs.
 */
export async function listPublicCatalog(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, description, discount_percent, spice_level, image_url, sales_unit, product_pack_sizes(*)')
    .eq('is_active', true)
    // Raw materials sit in the same table now; only sellable goods belong
    // in front of a customer.
    .eq('is_sellable', true)
    .order('name')
  if (error) throw error

  return (
    data
      // An item with no pack size has no price, so it cannot be bought.
      // deno-lint-ignore no-explicit-any
      .filter((row: any) => row.product_pack_sizes.length > 0)
      // deno-lint-ignore no-explicit-any
      .map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    salesUnit: row.sales_unit,
    packSizes: [...row.product_pack_sizes]
      .sort(byQty)
      // deno-lint-ignore no-explicit-any
      .map((p: any) => ({ qty: Number(p.pack_qty), price: Number(p.price), packaging: p.packaging ?? null })),
        discountPercent: row.discount_percent,
        spiceLevel: row.spice_level,
        imageUrl: row.image_url ?? null,
      }))
  )
}
