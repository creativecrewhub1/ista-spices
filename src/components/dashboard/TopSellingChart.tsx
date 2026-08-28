import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { SectionCard } from './SectionCard'
import { productRevenue } from '@/data/mock-data'
import { formatCompactNumber } from '@/lib/format'

export function TopSellingChart() {
  const topFive = [...productRevenue].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5)
  const chartData = [...topFive].reverse()

  return (
    <SectionCard title="Top 5 selling items">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} stroke="var(--color-border)" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: number) => formatCompactNumber(value)}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={130}
              tick={{ fontSize: 12, fill: 'var(--color-foreground)' }}
            />
            <Tooltip
              cursor={{ fill: 'var(--color-muted)' }}
              formatter={(value) => [`${formatCompactNumber(Number(value))} units`, 'Units sold']}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="unitsSold" fill="var(--color-primary)" radius={[0, 6, 6, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}
