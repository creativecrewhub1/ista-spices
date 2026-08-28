import { useMemo } from 'react'
import { ClipboardList, IndianRupee, Receipt, Wallet } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { NeedsAttention } from '@/components/dashboard/NeedsAttention'
import { OrderStatusOverview } from '@/components/dashboard/OrderStatusOverview'
import { CapacityOverview } from '@/components/dashboard/CapacityOverview'
import { ProductTrend } from '@/components/dashboard/ProductTrend'
import { TopSellingChart } from '@/components/dashboard/TopSellingChart'
import { orders, revenueSummary } from '@/data/mock-data'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { DEMO_TODAY } from '@/lib/demo-clock'

export function DashboardPage() {
  const { pendingCount, avgOrderValue } = useMemo(() => {
    const todaysOrders = orders.filter((o) => o.placedAt.startsWith(DEMO_TODAY))
    const activeToday = todaysOrders.filter((o) => o.status !== 'cancelled')
    const pending = todaysOrders.filter((o) => o.status === 'pending').length
    const avg = activeToday.length
      ? activeToday.reduce((sum, o) => sum + o.total, 0) / activeToday.length
      : 0
    return { pendingCount: pending, avgOrderValue: avg }
  }, [])

  return (
    <div className="pb-8">
      <TopBar title="Dashboard" subtitle={`Today, ${formatDateLong(DEMO_TODAY)}`} />
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            label="Total revenue"
            value={formatCurrency(revenueSummary.total)}
            icon={Wallet}
            deltaPercent={revenueSummary.totalDelta}
            tone="primary"
          />
          <KpiCard
            label="Monthly revenue"
            value={formatCurrency(revenueSummary.monthly)}
            icon={IndianRupee}
            deltaPercent={revenueSummary.monthlyDelta}
            tone="accent"
          />
          <KpiCard
            label="Avg. order value"
            value={formatCurrency(avgOrderValue)}
            icon={Receipt}
            tone="success"
          />
          <KpiCard
            label="Pending orders"
            value={String(pendingCount)}
            icon={ClipboardList}
            tone="warning"
          />
        </div>

        <NeedsAttention />
        <OrderStatusOverview />
        <ProductTrend />
        <TopSellingChart />
        <CapacityOverview />
      </div>
    </div>
  )
}
