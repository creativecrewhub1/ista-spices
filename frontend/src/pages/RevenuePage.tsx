import { useEffect, useMemo, useState } from 'react'
import { IndianRupee, Wallet } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { RevenueChart } from '@/components/revenue/RevenueChart'
import { ProductRevenueTable } from '@/components/revenue/ProductRevenueTable'
import { ProductProfitTable } from '@/components/revenue/ProductProfitTable'
import { MonthlyExpensesPanel } from '@/components/revenue/MonthlyExpensesPanel'
import { LoadingState, ErrorState, KpiSkeleton } from '@/components/common/QueryState'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useMonthlyProfit,
  useProfitMonths,
  useRevenueByDay,
  useRevenueByProduct,
  useRevenueByWeek,
  useRevenueSummary,
} from '@/data/queries'
import { formatCurrency, formatMonth, formatWeekday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type RangeValue = 'weekly' | 'monthly'

export function RevenuePage() {
  const [range, setRange] = useState<RangeValue>('weekly')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [month, setMonth] = useState('')

  const summaryQuery = useRevenueSummary()
  const dailyQuery = useRevenueByDay(7)
  const weeklyQuery = useRevenueByWeek(28)
  const productRevenueQuery = useRevenueByProduct()
  const monthsQuery = useProfitMonths()
  const profitQuery = useMonthlyProfit(month)

  // The list arrives newest first, so the most recent month is the one to
  // open on. Only set it once — after that the choice is the admin's.
  const months = monthsQuery.data
  useEffect(() => {
    if (!month && months?.length) setMonth(months[0])
  }, [month, months])

  const sortedProducts = useMemo(() => {
    const rows = [...(productRevenueQuery.data ?? [])]
    rows.sort((a, b) => (sortDirection === 'asc' ? a.revenue - b.revenue : b.revenue - a.revenue))
    return rows
  }, [productRevenueQuery.data, sortDirection])

  const activeQuery = range === 'weekly' ? dailyQuery : weeklyQuery

  return (
    <div className={cn('pb-8', pageEnter)}>
      <TopBar title="Revenue" subtitle="Track earnings across time and products" />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        {summaryQuery.isLoading ? (
          <KpiSkeleton count={2} />
        ) : summaryQuery.error ? (
          <ErrorState message={summaryQuery.error.message} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <KpiCard
              label="Total revenue"
              value={formatCurrency(summaryQuery.data!.total)}
              caption="All orders to date"
              icon={Wallet}
              tone="primary"
            />
            {/* This figure is a rolling 30-day window, not a calendar month —
                the label says so rather than claiming "vs last week". */}
            <KpiCard
              label="Revenue, last 30 days"
              value={formatCurrency(summaryQuery.data!.monthly)}
              caption="Rolling 30-day window"
              icon={IndianRupee}
              deltaPercent={summaryQuery.data!.monthlyDelta}
              deltaLabel="vs previous 30 days"
              tone="accent"
            />
          </div>
        )}

        <SectionCard
          title="Revenue over time"
          action={
            <Tabs value={range} onValueChange={(v) => setRange(v as RangeValue)}>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          }
        >
          {activeQuery.isLoading ? (
            <LoadingState />
          ) : activeQuery.error ? (
            <ErrorState message={activeQuery.error.message} />
          ) : (
            <RevenueChart
              data={activeQuery.data ?? []}
              formatLabel={range === 'weekly' ? formatWeekday : undefined}
            />
          )}
        </SectionCard>

        <SectionCard title="Product-wise revenue">
          {productRevenueQuery.isLoading ? (
            <LoadingState />
          ) : productRevenueQuery.error ? (
            <ErrorState message={productRevenueQuery.error.message} />
          ) : (
            <ProductRevenueTable
              rows={sortedProducts}
              sortDirection={sortDirection}
              onToggleSort={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
            />
          )}
        </SectionCard>

        {/* Profit, one month at a time: what each product earned, less what
            the goods sold cost, less its share of the month's running costs. */}
        <SectionCard
          title="Monthly profit"
          action={
            <Select value={month} onValueChange={setMonth} disabled={!months?.length}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Choose a month" />
              </SelectTrigger>
              <SelectContent>
                {(months ?? []).map((value) => (
                  <SelectItem key={value} value={value}>
                    {formatMonth(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {monthsQuery.error ? (
            <ErrorState message={monthsQuery.error.message} />
          ) : profitQuery.isLoading || !month ? (
            <LoadingState />
          ) : profitQuery.error ? (
            <ErrorState message={profitQuery.error.message} />
          ) : (
            <div className="flex flex-col gap-6">
              <ProductProfitTable profit={profitQuery.data!} />

              <div className="flex flex-col gap-3">
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-slate-900">
                    Miscellaneous costs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Costs for {formatMonth(month)} that do not belong to any one product. They
                    are shared across products in proportion to what each earned.
                  </p>
                </div>
                <MonthlyExpensesPanel
                  month={month}
                  expenses={profitQuery.data!.expenses}
                  total={profitQuery.data!.totals.overhead}
                />
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
