import * as profitRepo from '../repositories/profit.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { MonthlyExpense, MonthlyProfit, ProductProfitLine } from '../types/domain.ts'

const MONTH = /^\d{4}-\d{2}-01$/

/** Rejects anything that is not the first of a month, in ISO form. */
function requireMonth(month: string | undefined): string {
  if (!month) throw new HttpError(400, 'A month is required')
  // Callers may send any day of the month; the month is what matters.
  const first = month.length === 7 ? `${month}-01` : `${month.slice(0, 8)}01`
  if (!MONTH.test(first)) throw new HttpError(400, `${month} is not a month`)
  return first
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Shares the month's running costs across products in proportion to what
 * each earned, and gives the last product whatever rounding left over so the
 * apportioned parts always add back to the amount actually spent.
 */
function apportion(
  rows: Awaited<ReturnType<typeof profitRepo.productProfit>>,
  overheadTotal: number,
): ProductProfitLine[] {
  const revenueTotal = rows.reduce((sum, row) => sum + row.revenue, 0)
  let assigned = 0

  return rows.map((row, index) => {
    const last = index === rows.length - 1
    // With no revenue at all there is no share to compute, so the costs are
    // reported at month level and left off every product line.
    const share = revenueTotal > 0 ? row.revenue / revenueTotal : 0
    const overhead = last && revenueTotal > 0
      ? round(overheadTotal - assigned)
      : round(overheadTotal * share)
    assigned += overhead
    return { ...row, overhead, netProfit: round(row.grossProfit - overhead) }
  })
}

export const ProfitService = {
  /** Months the shop has either sold in or spent in, newest first. */
  months: (): Promise<string[]> => profitRepo.monthsWithActivity(),

  async forMonth(monthInput: string | undefined): Promise<MonthlyProfit> {
    const month = requireMonth(monthInput)
    const [rows, expenses] = await Promise.all([
      profitRepo.productProfit(month),
      profitRepo.listExpenses(month),
    ])

    const overheadTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
    const products = apportion(rows, overheadTotal)

    return {
      month,
      products,
      expenses,
      totals: {
        revenue: round(products.reduce((sum, p) => sum + p.revenue, 0)),
        materialCost: round(products.reduce((sum, p) => sum + p.materialCost, 0)),
        grossProfit: round(products.reduce((sum, p) => sum + p.grossProfit, 0)),
        // The amount actually spent, not the sum of the apportioned parts —
        // with no sales to apportion against, the two differ.
        overhead: round(overheadTotal),
        netProfit: round(
          products.reduce((sum, p) => sum + p.grossProfit, 0) - overheadTotal,
        ),
      },
    }
  },

  listExpenses(monthInput: string | undefined): Promise<MonthlyExpense[]> {
    return profitRepo.listExpenses(requireMonth(monthInput))
  },

  async addExpense(
    body: { month?: string; description?: string; amount?: number },
    userId: string | null,
  ): Promise<void> {
    const month = requireMonth(body.month)
    const description = body.description?.trim()
    if (!description) throw new HttpError(400, 'Say what the cost was for')

    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount < 0) {
      throw new HttpError(400, 'The amount must be zero or more')
    }

    await profitRepo.addExpense({ month, description, amount }, userId)
  },

  async removeExpense(id: string): Promise<void> {
    if (!id) throw new HttpError(400, 'Which cost is to be removed?')
    await profitRepo.removeExpense(id)
  },
}
