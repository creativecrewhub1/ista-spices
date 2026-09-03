import { supabase } from '../lib/supabaseClient.ts'
import type { ItemCategory, ItemInput, PackSize, PackSizeLabel } from '../types/domain.ts'

const ALL_PACK_SIZES: PackSizeLabel[] = ['250g', '500g', '1kg', '2kg']

/**
 * The three categories an admin picks between are not three kinds of record.
 * They are one record with an origin and two capabilities, and this is the
 * single place that translation happens — so a raw material can never be
 * saved as sellable, or a bought-in good as manufactured.
 */
const CAPABILITIES: Record<ItemCategory, {
  origin: 'manufactured' | 'purchased'
  isSellable: boolean
  isConsumable: boolean
}> = {
  raw_material:  { origin: 'purchased',    isSellable: false, isConsumable: true },
  b2b:           { origin: 'purchased',    isSellable: true,  isConsumable: false },
  manufacturing: { origin: 'manufactured', isSellable: true,  isConsumable: false },
}

const ID_PREFIX: Record<ItemCategory, string> = {
  raw_material: 'rm',
  b2b: 'b2b',
  manufacturing: 'p',
}

function generateId(category: ItemCategory): string {
  return `${ID_PREFIX[category]}-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

export async function save(input: ItemInput): Promise<string> {
  const caps = CAPABILITIES[input.category]
  const id = input.id || generateId(input.category)
  const isManufactured = input.category === 'manufacturing'

  const { error } = await supabase.from('products').upsert({
    id,
    name: input.name,
    description: input.description,
    stock_unit: input.stockUnit,
    sales_unit: caps.isSellable ? input.salesUnit : null,
    sales_to_stock_factor: input.salesToStockFactor,
    low_stock_threshold: input.lowStockThreshold,
    image_url: input.imageUrl,
    is_active: true,

    origin: caps.origin,
    is_sellable: caps.isSellable,
    is_consumable: caps.isConsumable,

    // Storefront classification, spice heat, batch size and discounting only
    // describe something the shop makes and sells. Writing them onto bought-in
    // stock would violate the table's own constraints, and rightly so.
    category: isManufactured ? input.productCategory : null,
    spice_level: isManufactured ? input.spiceLevel : null,
    batch_capacity: isManufactured ? input.batchCapacity : null,
    discount_percent: isManufactured ? input.discountPercent : 0,
  })
  if (error) throw error

  // Pack sizes are what make an item priceable, so only sellable manufactured
  // goods carry them. A zero price means that size isn't offered.
  if (isManufactured && input.packSizes.length > 0) {
    const priced = input.packSizes.filter((pack) => pack.price > 0)
    if (priced.length > 0) {
      const { error: packError } = await supabase
        .from('product_pack_sizes')
        .upsert(
          priced.map((pack) => ({ product_id: id, size: pack.size, price: pack.price })),
          { onConflict: 'product_id,size' },
        )
      if (packError) throw packError
    }

    // Sizes dropped to zero are withdrawn rather than left at a stale price.
    const withdrawn = input.packSizes.filter((pack) => pack.price <= 0).map((pack) => pack.size)
    if (withdrawn.length > 0) {
      const { error: delError } = await supabase
        .from('product_pack_sizes')
        .delete()
        .eq('product_id', id)
        .in('size', withdrawn)
      if (delError) throw delError
    }
  }

  return id
}

/** Soft delete — order_items reference products, so rows are never removed. */
export async function softDelete(id: string): Promise<void> {
  const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id)
  if (error) throw error
}

/**
 * One item in exactly the shape the form edits.
 *
 * The edit form must be loaded from this, never rebuilt from a list row:
 * a list DTO carries what the list draws, and any editable field missing
 * from it gets invented by the caller and then saved over the real value.
 * Everything writable is readable here for that reason.
 */
export async function findById(id: string): Promise<ItemInput | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_pack_sizes(size, price)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  // deno-lint-ignore no-explicit-any
  const row = data as any
  const priced: PackSize[] = row.product_pack_sizes.map(
    // deno-lint-ignore no-explicit-any
    (p: any) => ({ size: p.size, price: Number(p.price) }),
  )

  return {
    id: row.id,
    category: row.item_category,
    name: row.name,
    description: row.description ?? '',
    stockUnit: row.stock_unit,
    salesUnit: row.sales_unit ?? null,
    salesToStockFactor: Number(row.sales_to_stock_factor),
    lowStockThreshold: Number(row.low_stock_threshold),
    imageUrl: row.image_url ?? null,
    productCategory: row.category ?? 'spice-powder',
    spiceLevel: row.spice_level ?? null,
    // Sizes the product doesn't offer still need a row in the form so a
    // price can be set on them, so absent sizes come back at zero.
    packSizes: ALL_PACK_SIZES.map(
      (size) => priced.find((p) => p.size === size) ?? { size, price: 0 },
    ),
    discountPercent: row.discount_percent ?? 0,
    batchCapacity: row.batch_capacity ?? 30,
  }
}
