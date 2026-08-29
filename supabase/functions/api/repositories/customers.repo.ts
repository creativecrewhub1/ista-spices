import { supabase } from '../lib/supabaseClient.ts'
import type { Customer } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    initials: row.initials,
    address: row.address,
    joinedAt: row.joined_at,
    planStatus: row.plan_status,
    segment: row.segment,
    totalOrders: row.total_orders ?? 0,
    totalSpend: Number(row.total_spend ?? 0),
    lastOrderAt: row.last_order_at ?? row.joined_at,
  }
}

export async function listWithStats(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers_with_stats').select('*').order('name')
  if (error) throw error
  return data.map(mapRow)
}
