import { supabase } from '../lib/supabaseClient.ts'
import type { Customer, CustomerCounts, CustomerSegment } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? null,
    email: row.email ?? null,
    initials: row.initials,
    address: row.address ?? null,
    joinedAt: row.joined_at,
    planStatus: row.plan_status,
    segment: row.segment,
    totalOrders: row.total_orders ?? 0,
    totalSpend: Number(row.total_spend ?? 0),
    // Null when they have never ordered — not the same as "ordered on the
    // day they joined", which is what defaulting to joined_at implied.
    lastOrderAt: row.last_order_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    avatarUrl: row.avatar_url ?? null,
  }
}

export interface CustomerFilters {
  search?: string
  segment?: string
}

export async function listWithStats(filters: CustomerFilters = {}): Promise<Customer[]> {
  let query = supabase.from('customers_with_stats').select('*')

  if (filters.search) {
    const term = `%${filters.search}%`
    query = query.or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term},id.ilike.${term}`)
  }
  if (filters.segment) query = query.eq('segment', filters.segment)

  const { data, error } = await query.order('name')
  if (error) throw error
  return data.map(mapRow)
}

/**
 * Marks a customer as new or regular.
 *
 * Nothing derives this. Who counts as a regular is a judgement about the
 * relationship, and the shop makes it — so it is recorded when someone says
 * so, not guessed from an order count.
 */
/** Whether the customer exists at all, before writing anything to them. */
export async function findById(id: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from('customers').select('id').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as { id: string } | null) ?? null
}

export async function setSegment(id: string, segment: CustomerSegment): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({ segment, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

/** Whole-book tallies, so the KPI tiles stay stable while the list is filtered. */
export async function counts(): Promise<CustomerCounts> {
  const { data, error } = await supabase.from('customers_with_stats').select('segment')
  if (error) throw error

  const empty: CustomerCounts = { total: 0, new: 0, regular: 0 }
  // deno-lint-ignore no-explicit-any
  return (data as any[]).reduce((acc, row) => {
    acc.total += 1
    if (row.segment === 'new') acc.new += 1
    if (row.segment === 'regular') acc.regular += 1
    return acc
  }, empty)
}

/** The CRM customer record linked to a logged-in storefront account, if one exists yet. */
export async function findByUserId(userId: string): Promise<{ id: string } | null> {
  const { data, error } = await supabase.from('customers').select('id').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

/** The full profile a customer views/edits on their own account page. */
export async function findFullByUserId(userId: string): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers_with_stats')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? mapRow(data) : null
}

function initialsFrom(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * A customer editing their own name/phone/address/avatar. Only provided
 * fields change. Upserts rather than assuming a row exists — a customer who
 * signed in with Google before the signup trigger started creating one has
 * only a `profiles` row, and a plain UPDATE against zero matching rows would
 * succeed silently while saving nothing.
 */
export async function updateForUser(userId: string, input: {
  name?: string
  phone?: string
  address?: string
  avatarUrl?: string
}): Promise<void> {
  // deno-lint-ignore no-explicit-any
  const patch: Record<string, any> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.phone !== undefined) patch.phone = input.phone
  if (input.address !== undefined) patch.address = input.address
  if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl
  // Renaming yourself doesn't change your initials automatically — the admin
  // side never does this either, so it stays a deliberate, separate choice.

  const { data, error } = await supabase
    .from('customers')
    .update(patch)
    .eq('user_id', userId)
    .select('id')
  if (error) throw error
  if (data.length > 0) return

  const name = input.name ?? 'Customer'
  const { error: insertError } = await supabase.from('customers').insert({
    id: `c-${crypto.randomUUID().slice(0, 10)}`,
    user_id: userId,
    name,
    phone: input.phone ?? null,
    address: input.address ?? null,
    avatar_url: input.avatarUrl ?? null,
    initials: initialsFrom(name),
  })
  if (insertError) throw insertError
}

/**
 * Scrubs a customer's personal data on account deletion, keeping the row
 * itself (and its id) so past orders stay attached to a real business
 * record instead of being orphaned or cascade-deleted. Clears `user_id` too
 * — required before the caller can delete the underlying auth user, since
 * that FK has no cascade.
 */
export async function anonymizeForUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update({
      name: 'Deleted user',
      phone: null,
      address: null,
      email: null,
      avatar_url: null,
      initials: 'DU',
      user_id: null,
    })
    .eq('user_id', userId)
  if (error) throw error
}

/**
 * Uploads a customer's chosen photo to the `avatars` bucket and links it as
 * their avatar. Always written to the same path (the user's own id, no
 * extension) with `upsert: true`, so a re-upload replaces the old file in
 * place rather than leaving orphaned objects behind — the served
 * Content-Type comes from the stored object's own metadata, not the path.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(userId, bytes, { contentType: file.type, upsert: true })
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('avatars').getPublicUrl(userId)
  // Appends a cache-busting param so the browser doesn't keep showing the
  // previous photo it already cached at this exact same URL.
  const url = `${data.publicUrl}?v=${Date.now()}`
  await updateForUser(userId, { avatarUrl: url })
  return url
}

/** Creates the CRM customer record for a storefront account's first order. */
export async function createForUser(
  userId: string,
  input: { name: string; phone: string; address: string; email?: string },
): Promise<string> {
  const id = `c-${crypto.randomUUID().slice(0, 10)}`

  const { error } = await supabase.from('customers').insert({
    id,
    user_id: userId,
    name: input.name,
    phone: input.phone,
    address: input.address,
    email: input.email ?? null,
    initials: initialsFrom(input.name),
  })
  if (error) throw error
  return id
}
