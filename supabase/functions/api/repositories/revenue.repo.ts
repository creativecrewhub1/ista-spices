import { supabase } from '../lib/supabaseClient.ts'

export interface RevenueByDayRow {
  day: string
  revenue: number
}

export interface RevenueByProductRow {
  product_id: string
  product_name: string
  units_sold: number
  revenue: number
}

export async function byDay(sinceIso?: string): Promise<RevenueByDayRow[]> {
  let query = supabase.from('revenue_by_day').select('*').order('day')
  if (sinceIso) query = query.gte('day', sinceIso)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function byProduct(): Promise<RevenueByProductRow[]> {
  const { data, error } = await supabase
    .from('revenue_by_product')
    .select('*')
    .order('revenue', { ascending: false })
  if (error) throw error
  return data
}

export async function byProductByDay(productId: string, sinceIso: string): Promise<RevenueByDayRow[]> {
  const { data, error } = await supabase
    .from('revenue_by_product_by_day')
    .select('day, revenue')
    .eq('product_id', productId)
    .gte('day', sinceIso)
    .order('day')
  if (error) throw error
  return data
}
