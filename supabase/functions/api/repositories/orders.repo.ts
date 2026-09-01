import { supabase } from '../lib/supabaseClient.ts'
import type { Order, OrderStatus, PackSizeLabel } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Order {
  const items = (row.order_items ?? []).map(
    // deno-lint-ignore no-explicit-any
    (item: any) => ({
      productId: item.product_id,
      name: item.products?.name ?? item.product_id,
      packSize: item.pack_size,
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

export async function list(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name), order_items(*, products(name))')
    .order('placed_at', { ascending: false })
  if (error) throw error
  return data.map(mapRow)
}

export async function updateStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({
      status,
      delivered_at: status === 'delivered' ? new Date().toISOString() : null,
    })
    .eq('id', orderId)
  if (error) throw error
}

export async function listForCustomer(customerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(name), order_items(*, products(name))')
    .eq('customer_id', customerId)
    .order('placed_at', { ascending: false })
  if (error) throw error
  return data.map(mapRow)
}

/** Authoritative prices for a checkout — never trust a price the client sends. */
export async function getPackPrices(
  productIds: string[],
): Promise<{ product_id: string; size: PackSizeLabel; price: number }[]> {
  const { data, error } = await supabase
    .from('product_pack_sizes')
    .select('product_id, size, price')
    .in('product_id', productIds)
  if (error) throw error
  return data.map((row) => ({ ...row, price: Number(row.price) }))
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
  items: { productId: string; packSize: PackSizeLabel; qty: number; price: number }[],
): Promise<void> {
  const { error } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      pack_size: item.packSize,
      qty: item.qty,
      price: item.price,
    })),
  )
  if (error) throw error
}
