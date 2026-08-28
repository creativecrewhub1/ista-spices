import { useMemo, useState } from 'react'
import { IndianRupee, Wallet } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { SectionCard } from '@/components/dashboard/SectionCard'
import { RevenueChart } from '@/components/revenue/RevenueChart'
import { ProductRevenueTable } from '@/components/revenue/ProductRevenueTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { weeklyRevenue, monthlyRevenue, productRevenue, revenueSummary } from '@/data/mock-data'
import { formatCurrency } from '@/lib/format'

type RangeValue = 'weekly' | 'monthly'

export function RevenuePage() {
  const [range, setRange] = useState<RangeValue>('weekly')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortedProducts = useMemo(() => {
    const rows = [...productRevenue]
    rows.sort((a, b) => (sortDirection === 'asc' ? a.revenue - b.revenue : b.revenue - a.revenue))
    return rows
  }, [sortDirection])

  return (
    <div className="pb-8">
      <TopBar title="Revenue" subtitle="Track earnings across time and products" />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        </div>

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
          <RevenueChart data={range === 'weekly' ? weeklyRevenue : monthlyRevenue} />
        </SectionCard>

        <SectionCard title="Product-wise revenue">
          <ProductRevenueTable
            rows={sortedProducts}
            sortDirection={sortDirection}
            onToggleSort={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
          />
        </SectionCard>
      </div>
    </div>
  )
}
