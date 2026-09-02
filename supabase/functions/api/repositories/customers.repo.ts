import { supabase } from '../lib/supabaseClient.ts'
import type { Customer, CustomerCounts } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? null,
    initials: row.initials,
    address: row.address,
    joinedAt: row.joined_at,
    planStatus: row.plan_status,
    segment: row.segment,
    totalOrders: row.total_orders ?? 0,
    totalSpend: Number(row.total_spend ?? 0),
    // Null when they have never ordered — not the same as "ordered on the
    // day they joined", which is what defaulting to joined_at implied.
    lastOrderAt: row.last_order_at ?? null,
    isActive: row.is_active ?? false,
  }
}

export interface CustomerFilters {
  search?: string
  /** 'active' | 'inactive', or a CustomerSegment. */
  segment?: string
  activity?: string
}

export async function listWithStats(filters: CustomerFilters = {}): Promise<Customer[]> {
  let query = supabase.from('customers_with_stats').select('*')

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term},id.ilike.${term}`)
  }
  if (filters.segment) query = query.eq('segment', filters.segment)
  if (filters.activity === 'active') query = query.eq('is_active', true)
  if (filters.activity === 'inactive') query = query.or('is_active.is.false,is_active.is.null')

  const { data, error } = await query.order('name')
  if (error) throw error
  return data.map(mapRow)
}

/** Whole-book tallies, so the KPI tiles stay stable while the list is filtered. */
export async function counts(): Promise<CustomerCounts> {
  const { data, error } = await supabase.from('customers_with_stats').select('segment, is_active')
  if (error) throw error

  const empty: CustomerCounts = { total: 0, active: 0, inactive: 0, new: 0, regular: 0, vip: 0 }
  // deno-lint-ignore no-explicit-any
  return (data as any[]).reduce((acc, row) => {
    acc.total += 1
    if (row.is_active) acc.active += 1
    else acc.inactive += 1
    if (row.segment === 'new') acc.new += 1
    if (row.segment === 'regular') acc.regular += 1
    if (row.segment === 'vip') acc.vip += 1
    return acc
  }, empty)
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
