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

/** The CRM customer record linked to a logged-in storefront account, if one exists yet. */
export async function findByUserId(userId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from('customers').select('id').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

/** Creates the CRM customer record for a storefront account's first order. */
export async function createForUser(
  userId: string,
  input: { name: string; phone: string; address: string; email?: string },
): Promise<string> {
  const id = `c-${crypto.randomUUID().slice(0, 10)}`
  const initials = input.name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const { error } = await supabase.from('customers').insert({
    id,
    user_id: userId,
    name: input.name,
    phone: input.phone,
    address: input.address,
    email: input.email ?? null,
    initials,
  })
  if (error) throw error
  return id
}
