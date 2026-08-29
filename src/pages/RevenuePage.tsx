import { useMemo, useState } from 'react'
import { IndianRupee, Wallet } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { RevenueChart } from '@/components/revenue/RevenueChart'
import { ProductRevenueTable } from '@/components/revenue/ProductRevenueTable'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRevenueByDay, useRevenueByProduct, useRevenueByWeek, useRevenueSummary } from '@/data/queries'
import { formatCurrency, formatWeekday } from '@/lib/format'

type RangeValue = 'weekly' | 'monthly'

export function RevenuePage() {
  const [range, setRange] = useState<RangeValue>('weekly')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const summaryQuery = useRevenueSummary()
  const dailyQuery = useRevenueByDay(7)
  const weeklyQuery = useRevenueByWeek(28)
  const productRevenueQuery = useRevenueByProduct()

  const sortedProducts = useMemo(() => {
    const rows = [...(productRevenueQuery.data ?? [])]
    rows.sort((a, b) => (sortDirection === 'asc' ? a.revenue - b.revenue : b.revenue - a.revenue))
    return rows
  }, [productRevenueQuery.data, sortDirection])

  const activeQuery = range === 'weekly' ? dailyQuery : weeklyQuery

  return (
    <div className="pb-8">
      <TopBar title="Revenue" subtitle="Track earnings across time and products" />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        {summaryQuery.isLoading ? (
          <LoadingState label="Loading revenue…" />
        ) : summaryQuery.error ? (
          <ErrorState message={summaryQuery.error.message} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <KpiCard
              label="Total revenue"
              value={formatCurrency(summaryQuery.data!.total)}
              icon={Wallet}
              tone="primary"
            />
            <KpiCard
              label="Monthly revenue"
              value={formatCurrency(summaryQuery.data!.monthly)}
              icon={IndianRupee}
              deltaPercent={summaryQuery.data!.monthlyDelta}
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
      </div>
    </div>
  )
}
