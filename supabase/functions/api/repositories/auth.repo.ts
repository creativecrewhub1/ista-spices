import { supabase } from '../lib/supabaseClient.ts'

export async function adminExists(): Promise<boolean> {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
  if (error) throw error
  return data.users.length > 0
}

export async function createAdminUser(email: string, password: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  return data.user
}
