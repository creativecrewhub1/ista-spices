import { supabase } from '../lib/supabaseClient.ts'

export type UserRole = 'admin' | 'customer'

export async function adminExists(): Promise<boolean> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'admin')
  if (error) throw error
  return (count ?? 0) > 0
}

export async function createAdminUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error

  // The on_auth_user_created trigger already inserted a 'customer' row for
  // this new user, same as it does for everyone — promote it, since this
  // signup path is the only way an admin account is ever created.
  const { error: roleError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', data.user!.id)
  if (roleError) throw roleError

  return data.user
}

export async function getRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (error) throw error
  return (data?.role as UserRole | undefined) ?? null
}

/**
 * Deletes the auth account itself — the `profiles` row goes with it via its
 * own ON DELETE CASCADE. Call only after the caller's `customers` row has
 * already been anonymized and unlinked (`user_id` cleared): the FK from
 * `customers.user_id` to `auth.users` has no cascade, so deleting a user
 * still referenced there would fail.
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error
}
