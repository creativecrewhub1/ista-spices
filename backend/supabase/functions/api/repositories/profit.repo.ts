import { supabase } from '../lib/supabaseClient.ts'
import type { MonthlyExpense, ProductProfitRow } from '../types/domain.ts'

/**
 * Profit is assembled from three separate ledgers, and each answers a
 * different question:
 *
 *   what was sold      order_items, through order_line_revenue
 *   what it cost       stock_batch_allocations against sale movements
 *   what running costs monthly_expenses
 *
 * They are kept apart because they are recorded at different moments by
 * different acts, and folding them into one table would mean a rent payment
 * and a sale sharing a row.
 */

/** Per-product revenue, cost of goods and gross profit for one month. */
export async function productProfit(month: string): Promise<ProductProfitRow[]> {
  const { data, error } = await supabase
    .from('product_profit_by_month')
    .select('product_id, product_name, units_sold, revenue, material_cost, gross_profit')
    .eq('month', month)
    .order('revenue', { ascending: false })
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    unitsSold: Number(row.units_sold),
    revenue: Number(row.revenue),
    materialCost: Number(row.material_cost),
    grossProfit: Number(row.gross_profit),
  }))
}

/** Every month that has either a sale or a running cost recorded against it. */
export async function monthsWithActivity(): Promise<string[]> {
  const [{ data: sold, error: soldError }, { data: spent, error: spentError }] = await Promise.all([
    supabase.from('product_revenue_by_month').select('month'),
    supabase.from('monthly_expenses').select('month'),
  ])
  if (soldError) throw soldError
  if (spentError) throw spentError

  // deno-lint-ignore no-explicit-any
  const months = new Set<string>([...(sold as any[]), ...(spent as any[])].map((r) => r.month))
  // The current month belongs in the list even before anything happens in it,
  // so costs can be entered as they are incurred rather than afterwards.
  months.add(new Date().toISOString().slice(0, 8) + '01')
  return [...months].sort().reverse()
}

export async function listExpenses(month: string): Promise<MonthlyExpense[]> {
  const { data, error } = await supabase
    .from('monthly_expenses')
    .select('id, month, description, amount, created_at')
    .eq('month', month)
    .order('created_at', { ascending: true })
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    id: String(row.id),
    month: row.month,
    description: row.description,
    amount: Number(row.amount),
    createdAt: row.created_at,
  }))
}

export async function addExpense(
  input: { month: string; description: string; amount: number },
  userId: string | null,
): Promise<void> {
  const { error } = await supabase.from('monthly_expenses').insert({
    month: input.month,
    description: input.description.trim(),
    amount: input.amount,
    created_by: userId,
  })
  if (error) throw error
}

export async function removeExpense(id: string): Promise<void> {
  const { error } = await supabase.from('monthly_expenses').delete().eq('id', id)
  if (error) throw error
}
