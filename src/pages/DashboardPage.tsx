import { ClipboardList, IndianRupee, Receipt, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { NeedsAttention } from '@/components/dashboard/NeedsAttention'
import { OrderStatusOverview } from '@/components/dashboard/OrderStatusOverview'
import { CapacityOverview } from '@/components/dashboard/CapacityOverview'
import { ProductTrend } from '@/components/dashboard/ProductTrend'
import { TopSellingChart } from '@/components/dashboard/TopSellingChart'
import { ErrorState, KpiSkeleton } from '@/components/common/QueryState'
import { useTodaySummary, useRevenueSummary } from '@/data/queries'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { pageEnter } from '@/lib/motion'

export function DashboardPage() {
  const todayQuery = useTodaySummary()
  const revenueQuery = useRevenueSummary()

  return (
    <div className={cn('pb-8', pageEnter)}>
      <TopBar title="Dashboard" subtitle={`Today, ${formatDateLong(new Date().toISOString())}`} />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        {revenueQuery.isLoading || todayQuery.isLoading ? (
          <KpiSkeleton count={4} />
        ) : revenueQuery.error || todayQuery.error ? (
          <ErrorState message={(revenueQuery.error ?? todayQuery.error)!.message} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Total revenue"
              value={formatCurrency(revenueQuery.data!.total)}
              icon={Wallet}
              tone="primary"
            />
            <KpiCard
              label="Monthly revenue"
              value={formatCurrency(revenueQuery.data!.monthly)}
              icon={IndianRupee}
              deltaPercent={revenueQuery.data!.monthlyDelta}
              tone="accent"
            />
            <KpiCard
              label="Avg. order value"
              value={formatCurrency(todayQuery.data!.avgOrderValue)}
              icon={Receipt}
              tone="success"
            />
            <KpiCard
              label="Pending orders"
              value={String(todayQuery.data!.pendingCount)}
              icon={ClipboardList}
              tone="warning"
            />
          </div>
        )}

        <NeedsAttention />
        <OrderStatusOverview />
        <ProductTrend />
        <TopSellingChart />
        <CapacityOverview />
      </div>
    </div>
  )
}
