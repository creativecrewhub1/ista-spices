import { supabase } from '../lib/supabaseClient.ts'
import type { Order, OrderStatus } from '../types/domain.ts'

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
