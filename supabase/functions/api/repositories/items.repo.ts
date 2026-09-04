import { supabase } from '../lib/supabaseClient.ts'
import type {
  AuditEntry,
  ItemCategory,
  ItemInput,
  ItemName,
  PackSize,
  RemovedItem,
} from '../types/domain.ts'

/**
 * An order still owed to the customer. Once it is delivered or cancelled the
 * shop owes nothing, and the line becomes history — which must not keep a
 * product in the catalogue for good.
 */
const OPEN_STATUSES = ['pending', 'processing', 'packed', 'shipped']

/**
 * Case, padding and repeated spaces are not what makes two items different.
 * The unique index on products applies this same rule, so the form and the
 * database agree on what counts as the same name.
 */
export function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Names in the catalogue, so the form can warn before the database refuses.
 *
 * Active only, which is the same set the unique index covers. A removed item
 * is not in the catalogue and cannot be restored from anywhere in the app, so
 * offering its name as a suggestion — or refusing a new item because of it —
 * would be a dead end.
 */
export async function listNames(): Promise<ItemName[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, item_category')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.item_category,
  }))
}

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

export async function save(input: ItemInput, userId: string | null): Promise<string> {
  const caps = CAPABILITIES[input.category]
  const creating = !input.id
  const id = input.id || generateId(input.category)
  const isManufactured = input.category === 'manufacturing'

  const { error } = await supabase.from('products').upsert({
    id,
    // Trimmed on the way in. A trailing space is invisible in the form but
    // makes the name a different string to everything that compares it.
    name: input.name.trim(),
    description: input.description.trim(),
    stock_unit: input.stockUnit,
    sales_unit: caps.isSellable ? input.salesUnit : null,
    sales_to_stock_factor: input.salesToStockFactor,
    low_stock_threshold: input.lowStockThreshold,
    image_url: input.imageUrl,

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

    // The audit trigger reads these off the row, so every change carries the
    // person who made it. created_by is written once and never overwritten.
    ...(creating ? { created_by: userId } : {}),
    updated_by: userId,
  })
  if (error) throw error

  // Pack sizes are what make an item priceable, so anything sellable carries
  // them — a resold B2B good just as much as one the shop makes. The
  // submitted list is the whole truth: a quantity the admin took off the form
  // is withdrawn from the catalogue.
  if (caps.isSellable) {
    const quantities = input.packSizes.map((pack) => pack.qty)

    if (quantities.length > 0) {
      const { error: packError } = await supabase
        .from('product_pack_sizes')
        .upsert(
          input.packSizes.map((pack) => ({
            product_id: id,
            pack_qty: pack.qty,
            price: pack.price,
            packaging: pack.packaging || null,
          })),
          { onConflict: 'product_id,pack_qty' },
        )
      if (packError) throw packError
    }

    // Withdrawing one leaves past orders intact — an order line records the
    // quantity and price it sold at rather than pointing at this row.
    let stale = supabase.from('product_pack_sizes').delete().eq('product_id', id)
    if (quantities.length > 0) stale = stale.not('pack_qty', 'in', `(${quantities.join(',')})`)
    const { error: delError } = await stale
    if (delError) throw delError
  }

  return id
}

/**
 * Soft delete. Order lines, stock movements and revenue all point at this
 * row, so it stays and is only hidden. deleted_at records when, deleted_by
 * who — a check constraint keeps those in step with is_active.
 */
export async function softDelete(id: string, userId: string | null): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      is_active: false,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      updated_by: userId,
    })
    .eq('id', id)
    .eq('is_active', true)
  if (error) throw error
}

/** Puts a removed item back, clearing the removal record with it. */
export async function restore(id: string, userId: string | null): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: true, deleted_at: null, deleted_by: null, updated_by: userId })
    .eq('id', id)
    .eq('is_active', false)
  if (error) throw error
}

/**
 * What the ledger says is on hand. item_stock is the derived balance the
 * Stock screen reads, so removal is judged against the same number the admin
 * is looking at rather than a second opinion.
 */
export async function quantityOnHand(id: string): Promise<number> {
  const { data, error } = await supabase
    .from('item_stock')
    .select('quantity_on_hand')
    .eq('item_id', id)
    .maybeSingle()
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return data ? Number((data as any).quantity_on_hand) : 0
}

/**
 * Everything that has happened to an item, newest first. The rows are
 * written by database triggers, so this is the whole story regardless of
 * which code path made the change.
 */
export async function listAudit(id: string): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('item_audit_log')
    .select('id, version, action, changed_at, changed_by, changes, profiles:changed_by(email)')
    .eq('item_id', id)
    .order('id', { ascending: false })
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    id: row.id,
    version: row.version,
    action: row.action,
    changedAt: row.changed_at,
    changedBy: row.profiles?.email ?? null,
    // Stored as {field: {from, to}}; a list is easier to render in order.
    changes: Object.entries(row.changes ?? {}).map(([field, value]) => ({
      field,
      // deno-lint-ignore no-explicit-any
      from: (value as any)?.from ?? null,
      // deno-lint-ignore no-explicit-any
      to: (value as any)?.to ?? null,
    })),
  }))
}

/** Order lines for this item that the shop has not finished with. */
export async function openOrderLines(id: string): Promise<number> {
  const { data, error } = await supabase
    .from('order_items')
    .select('id, orders(status)')
    .eq('product_id', id)
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).filter((line) => OPEN_STATUSES.includes(line.orders?.status)).length
}

/** Whether an item exists, and whether it is still in the catalogue. */
export async function findState(
  id: string,
): Promise<{ name: string; isActive: boolean; stockUnit: string } | null> {
  const { data, error } = await supabase
    .from('products')
    .select('name, is_active, stock_unit')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  const row = data as any
  return row ? { name: row.name, isActive: row.is_active, stockUnit: row.stock_unit } : null
}

/**
 * Removed items, with what still depends on them. Stock and order counts are
 * the reason this is a soft delete, so they are shown rather than implied.
 */
export async function listRemoved(): Promise<RemovedItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, item_category, stock_unit, deleted_at, deleted_by, profiles:deleted_by(email)')
    .eq('is_active', false)
    .order('deleted_at', { ascending: false })
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  const rows = data as any[]
  if (rows.length === 0) return []

  const ids = rows.map((row) => row.id)
  // item_stock hides removed items by design, so the balance is summed from
  // the ledger directly — the quantity is still there, just not on display.
  const [{ data: moves, error: moveError }, { data: lines, error: lineError }] = await Promise.all([
    supabase.from('stock_movements').select('item_id, qty').in('item_id', ids),
    supabase.from('order_items').select('product_id').in('product_id', ids),
  ])
  if (moveError) throw moveError
  if (lineError) throw lineError

  const onHand = new Map<string, number>()
  // deno-lint-ignore no-explicit-any
  for (const move of (moves ?? []) as any[]) {
    onHand.set(move.item_id, (onHand.get(move.item_id) ?? 0) + Number(move.qty))
  }
  const lineCount = new Map<string, number>()
  // deno-lint-ignore no-explicit-any
  for (const line of (lines ?? []) as any[]) {
    lineCount.set(line.product_id, (lineCount.get(line.product_id) ?? 0) + 1)
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.item_category,
    removedAt: row.deleted_at,
    removedBy: row.profiles?.email ?? null,
    quantityOnHand: onHand.get(row.id) ?? 0,
    stockUnit: row.stock_unit,
    orderLines: lineCount.get(row.id) ?? 0,
  }))
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
    .select('*, product_pack_sizes(pack_qty, price, packaging)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  // deno-lint-ignore no-explicit-any
  const row = data as any
  const packSizes: PackSize[] = row.product_pack_sizes
    // deno-lint-ignore no-explicit-any
    .map((p: any) => ({
      qty: Number(p.pack_qty),
      price: Number(p.price),
      packaging: p.packaging ?? null,
    }))
    .sort((a: PackSize, b: PackSize) => a.qty - b.qty)

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
    packSizes,
    discountPercent: row.discount_percent ?? 0,
    batchCapacity: row.batch_capacity ?? 30,
  }
}
