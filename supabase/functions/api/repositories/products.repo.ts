import { supabase } from '../lib/supabaseClient.ts'
import type { CatalogProduct, PackSizeLabel, Product, StockLevel } from '../types/domain.ts'

const PACK_SIZE_ORDER: PackSizeLabel[] = ['250g', '500g', '1kg', '2kg']

/** low <= 30% of batch capacity in hand, high >= 90% (well stocked), otherwise ok. */
export function classifyStockLevel(unitsPacked: number, batchCapacity: number): StockLevel {
  const ratio = unitsPacked / batchCapacity
  if (ratio >= 0.9) return 'high'
  if (ratio <= 0.3) return 'low'
  return 'ok'
}

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Product {
  const packSizes = [...row.product_pack_sizes]
    // deno-lint-ignore no-explicit-any
    .sort((a: any, b: any) => PACK_SIZE_ORDER.indexOf(a.size) - PACK_SIZE_ORDER.indexOf(b.size))
    // deno-lint-ignore no-explicit-any
    .map((p: any) => ({ size: p.size, price: Number(p.price) }))

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    packSizes,
    discountPercent: row.discount_percent,
    spiceLevel: row.spice_level,
    batchCapacity: row.batch_capacity,
    unitsPackedThisBatch: row.units_packed_this_batch,
    stockState: row.stock_state,
    stockLevel: classifyStockLevel(row.units_packed_this_batch, row.batch_capacity),
    isActive: row.is_active,
  }
}

export async function listActive(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_pack_sizes(*)')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data.map(mapRow)
}

export async function upsert(product: Product): Promise<void> {
  const { error: productError } = await supabase.from('products').upsert({
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    discount_percent: product.discountPercent,
    spice_level: product.spiceLevel,
    batch_capacity: product.batchCapacity,
    units_packed_this_batch: product.unitsPackedThisBatch,
    stock_state: product.stockState,
    is_active: product.isActive,
  })
  if (productError) throw productError

  const { error: packSizeError } = await supabase.from('product_pack_sizes').upsert(
    product.packSizes.map((pack) => ({
      product_id: product.id,
      size: pack.size,
      price: pack.price,
    })),
    { onConflict: 'product_id,size' },
  )
  if (packSizeError) throw packSizeError
}

/** Soft delete only — order_items reference products, so a hard DELETE would violate the FK. */
export async function softDelete(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

/**
 * Public storefront read — active products only, and only the fields a
 * customer needs to shop (no batch/production internals like batchCapacity
 * or stockState).
 */
export async function listPublicCatalog(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, description, discount_percent, spice_level, product_pack_sizes(*)')
    .eq('is_active', true)
    .order('name')
  if (error) throw error

  // deno-lint-ignore no-explicit-any
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    packSizes: [...row.product_pack_sizes]
      // deno-lint-ignore no-explicit-any
      .sort((a: any, b: any) => PACK_SIZE_ORDER.indexOf(a.size) - PACK_SIZE_ORDER.indexOf(b.size))
      // deno-lint-ignore no-explicit-any
      .map((p: any) => ({ size: p.size, price: Number(p.price) })),
    discountPercent: row.discount_percent,
    spiceLevel: row.spice_level,
  }))
}
