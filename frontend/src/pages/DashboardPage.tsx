import { ClipboardList, IndianRupee, PackageCheck, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { NeedsAttention } from '@/components/dashboard/NeedsAttention'
import { OrderStatusOverview } from '@/components/dashboard/OrderStatusOverview'
import { CapacityOverview } from '@/components/dashboard/CapacityOverview'
import { ProductTrend } from '@/components/dashboard/ProductTrend'
import { TopSellingChart } from '@/components/dashboard/TopSellingChart'
import { ErrorState, KpiSkeleton } from '@/components/common/QueryState'
import { useDashboardKpis } from '@/data/queries'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { pageEnter } from '@/lib/motion'

export function DashboardPage() {
  const kpiQuery = useDashboardKpis()

  return (
    <div className={cn('pb-8', pageEnter)}>
      <TopBar title="Dashboard" subtitle={`Today, ${formatDateLong(new Date().toISOString())}`} />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        {kpiQuery.isLoading ? (
          <KpiSkeleton count={4} />
        ) : kpiQuery.error ? (
          <ErrorState message={kpiQuery.error.message} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Total revenue"
              value={formatCurrency(kpiQuery.data!.totalRevenue)}
              caption="All orders to date"
              icon={Wallet}
              tone="primary"
            />
            <KpiCard
              label="Monthly revenue"
              value={formatCurrency(kpiQuery.data!.monthRevenue)}
              caption="This calendar month"
              icon={IndianRupee}
              tone="accent"
            />
            <KpiCard
              label="Active orders"
              value={String(kpiQuery.data!.activeOrders)}
              caption="Processing, packed or shipped"
              icon={PackageCheck}
              tone="success"
            />
            <KpiCard
              label="Pending orders"
              value={String(kpiQuery.data!.pendingOrders)}
              caption="Awaiting action"
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
