import { supabase } from '../lib/supabaseClient.ts'
import type {
  Order,
  OrderListFilters,
  OrderStatus,
  OrderStatusEvent,
} from '../types/domain.ts'

/** Every read of an order returns the same shape — one place to change it. */
const ORDER_SELECT = '*, customers(name, phone, email), order_items(*, products(name, image_url))'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Order {
  const items = (row.order_items ?? []).map(
    // deno-lint-ignore no-explicit-any
    (item: any) => ({
      productId: item.product_id,
      name: item.products?.name ?? item.product_id,
      imageUrl: item.products?.image_url ?? null,
      packQty: Number(item.pack_qty),
      packUnit: item.pack_unit,
      qty: item.qty,
      price: Number(item.price),
    }),
  )
  const total = items.reduce(
    // deno-lint-ignore no-explicit-any
    (sum: number, item: any) => sum + item.qty * item.price,
    0,
  )

  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customers?.name ?? '',
    customerPhone: row.customers?.phone ?? null,
    customerEmail: row.customers?.email ?? null,
    items,
    total,
    status: row.status,
    kind: row.kind,
    placedAt: row.placed_at,
    packedDate: row.packed_date ?? row.placed_at.slice(0, 10),
    eta: row.eta ?? row.placed_at,
    deliveredAt: row.delivered_at,
    address: row.address,
  }
}

export async function list(filters: OrderListFilters = {}): Promise<Order[]> {
  let query = supabase.from('orders').select(ORDER_SELECT)

  // Hits orders_status_placed_at_idx.
  if (filters.status) query = query.eq('status', filters.status)

  // Trigram-indexed ILIKE on the order id; customer-name matches are applied
  // after the fetch since PostgREST can't OR across an embedded table.
  const search = filters.search?.trim()
  if (search) query = query.ilike('id', `%${search}%`)

  const { data, error } = await query.order('placed_at', { ascending: false })
  if (error) throw error
  return data.map(mapRow)
}

/**
 * Status tallies for the KPI tiles, read from the order_status_counts view.
 * Kept separate from the list query so the tiles keep showing whole-business
 * totals while the list itself is filtered down.
 */
export async function getStatusCounts(): Promise<Record<OrderStatus, number>> {
  const { data, error } = await supabase.from('order_status_counts').select('status, count')
  if (error) throw error

  const counts = {
    pending: 0,
    processing: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  } as Record<OrderStatus, number>
  for (const row of data) counts[row.status as OrderStatus] = row.count
  return counts
}

/** Customer-name half of the search — separate query so an id match and a
 * name match can be unioned without losing the index on either. */
export async function listByCustomerName(name: string, status?: OrderStatus): Promise<Order[]> {
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id')
    .ilike('name', `%${name}%`)
  if (customersError) throw customersError
  if (!customers.length) return []

  let query = supabase
    .from('orders')
    .select(ORDER_SELECT)
    .in(
      'customer_id',
      customers.map((c) => c.id),
    )
  if (status) query = query.eq('status', status)

  const { data, error } = await query.order('placed_at', { ascending: false })
  if (error) throw error
  return data.map(mapRow)
}

/**
 * Status changes carry their own timestamps: packing stamps packed_date,
 * delivery stamps delivered_at. Moving an order back off delivered clears
 * delivered_at so it never claims a delivery that was undone.
 */
export async function updateStatus(orderId: string, status: OrderStatus): Promise<void> {
  const now = new Date()
  // deno-lint-ignore no-explicit-any
  const patch: Record<string, any> = { status }

  if (status === 'delivered') {
    patch.delivered_at = now.toISOString()
  } else {
    patch.delivered_at = null
  }
  if (status === 'packed') {
    patch.packed_date = now.toISOString().slice(0, 10)
  }

  const { error } = await supabase.from('orders').update(patch).eq('id', orderId)
  if (error) throw error
}

export async function findById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select(ORDER_SELECT).eq('id', orderId).maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

/** The recorded transition history — when each step actually happened. */
export async function getStatusEvents(orderId: string): Promise<OrderStatusEvent[]> {
  const { data, error } = await supabase
    .from('order_status_events')
    .select('from_status, to_status, changed_at')
    .eq('order_id', orderId)
    .order('changed_at')
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    fromStatus: row.from_status,
    toStatus: row.to_status,
    changedAt: row.changed_at,
  }))
}

export async function listForCustomer(customerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('customer_id', customerId)
    .order('placed_at', { ascending: false })
  if (error) throw error
  return data.map(mapRow)
}

/** Authoritative prices for a checkout — never trust a price the client sends. */
export async function getPackPrices(
  productIds: string[],
): Promise<{ product_id: string; pack_qty: number; pack_unit: string; price: number }[]> {
  const { data, error } = await supabase
    .from('product_pack_sizes')
    .select('product_id, pack_qty, price, products(sales_unit)')
    .in('product_id', productIds)
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    product_id: row.product_id,
    pack_qty: Number(row.pack_qty),
    pack_unit: row.products?.sales_unit,
    price: Number(row.price),
  }))
}

export async function insertOrder(order: { id: string; customerId: string; address: string }): Promise<void> {
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    customer_id: order.customerId,
    status: 'pending',
    kind: 'one_time',
    address: order.address,
  })
  if (error) throw error
}

export async function insertOrderItems(
  orderId: string,
  items: { productId: string; packQty: number; packUnit: string; qty: number; price: number }[],
): Promise<void> {
  const { error } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      pack_qty: item.packQty,
      pack_unit: item.packUnit,
      qty: item.qty,
      price: item.price,
    })),
  )
  if (error) throw error
}
