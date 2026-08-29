import * as revenueRepo from '../repositories/revenue.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { ProductRevenueRow, RevenuePoint, RevenueSummary } from '../types/domain.ts'

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

/** Fills gaps with zero-revenue days so charts always render a continuous series. */
function zeroFillDays(byDay: Map<string, number>, days: number): RevenuePoint[] {
  const points: RevenuePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    points.push({ label: key, revenue: byDay.get(key) ?? 0 })
  }
  return points
}

/** Sums a chronological run of daily points into fixed-size buckets, labeled W1, W2, ... */
function toWeeklyBuckets(points: RevenuePoint[], bucketSize = 7): RevenuePoint[] {
  const buckets: RevenuePoint[] = []
  for (let i = 0; i < points.length; i += bucketSize) {
    const slice = points.slice(i, i + bucketSize)
    buckets.push({
      label: `W${buckets.length + 1}`,
      revenue: slice.reduce((sum, p) => sum + p.revenue, 0),
    })
  }
  return buckets
}

function sumRange(byDay: Map<string, number>, fromDaysAgo: number, toDaysAgo: number): number {
  let sum = 0
  for (let i = toDaysAgo; i < fromDaysAgo; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    sum += byDay.get(d.toISOString().slice(0, 10)) ?? 0
  }
  return sum
}

function percentDelta(current: number, previous: number): number | undefined {
  if (previous <= 0) return undefined
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export const RevenueService = {
  async byDay(days: number, bucket?: string): Promise<RevenuePoint[]> {
    if (!Number.isFinite(days) || days <= 0) {
      throw new HttpError(400, 'days must be a positive number')
    }
    const raw = await revenueRepo.byDay(isoDaysAgo(days - 1))
    const byDayMap = new Map(raw.map((row) => [row.day, Number(row.revenue)]))
    const daily = zeroFillDays(byDayMap, days)
    return bucket === 'week' ? toWeeklyBuckets(daily) : daily
  },

  async summary(): Promise<RevenueSummary> {
    const raw = await revenueRepo.byDay()
    const byDayMap = new Map(raw.map((row) => [row.day, Number(row.revenue)]))
    const total = [...byDayMap.values()].reduce((sum, v) => sum + v, 0)
    const last7 = sumRange(byDayMap, 7, 0)
    const prior7 = sumRange(byDayMap, 14, 7)
    const last30 = sumRange(byDayMap, 30, 0)
    const prior30 = sumRange(byDayMap, 60, 30)

    return {
      total,
      monthly: last30,
      monthlyDelta: percentDelta(last30, prior30),
      weekly: last7,
      weeklyDelta: percentDelta(last7, prior7),
    }
  },

  async byProduct(): Promise<ProductRevenueRow[]> {
    const raw = await revenueRepo.byProduct()
    return raw.map((row) => ({
      id: row.product_id,
      name: row.product_name,
      revenue: Number(row.revenue),
      unitsSold: row.units_sold,
    }))
  },

  async productTrend(productId: string, days: number): Promise<RevenuePoint[]> {
    if (!productId) throw new HttpError(400, 'productId is required')
    if (!Number.isFinite(days) || days <= 0) {
      throw new HttpError(400, 'days must be a positive number')
    }
    const raw = await revenueRepo.byProductByDay(productId, isoDaysAgo(days - 1))
    const byDayMap = new Map(raw.map((row) => [row.day, Number(row.revenue)]))
    return zeroFillDays(byDayMap, days)
  },
}
