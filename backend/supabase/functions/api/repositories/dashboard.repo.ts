import { supabase } from '../lib/supabaseClient.ts'
import type { DashboardKpis, TodaySummary } from '../types/domain.ts'

/**
 * KPI figures come back already aggregated by Postgres — one row, four
 * numbers — rather than pulling every order across the wire to add up here.
 * Month and day boundaries are Asia/Kolkata (see the view definitions).
 */
export async function getKpis(): Promise<DashboardKpis> {
  const { data, error } = await supabase.from('dashboard_kpis').select('*').single()
  if (error) throw error

  return {
    totalRevenue: Number(data.total_revenue),
    monthRevenue: Number(data.month_revenue),
    pendingOrders: data.pending_orders,
    activeOrders: data.active_orders,
  }
}

export async function getToday(): Promise<TodaySummary> {
  const { data, error } = await supabase.from('dashboard_today').select('*').single()
  if (error) throw error

  return {
    totalOrders: data.total_orders,
    statusCounts: {
      pending: data.pending,
      processing: data.processing,
      packed: data.packed,
      delivered: data.delivered,
    },
  }
}
