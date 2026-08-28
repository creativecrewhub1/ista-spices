import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { SectionCard } from './SectionCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { products, productWeeklyTrends } from '@/data/mock-data'
import { formatCurrency } from '@/lib/format'

export function ProductTrend() {
  const [productId, setProductId] = useState(products[0].id)

  const { product, trend, weekTotal } = useMemo(() => {
    const selected = products.find((p) => p.id === productId) ?? products[0]
    const series = productWeeklyTrends[selected.id] ?? []
    const total = series.reduce((sum, point) => sum + point.revenue, 0)
    return { product: selected, trend: series, weekTotal: total }
  }, [productId])

  return (
    <SectionCard
      title="Product revenue trend"
      action={
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger className="w-[13rem]" aria-label="Select product">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
          {formatCurrency(weekTotal)}
        </span>
        <span className="text-xs text-muted-foreground">this week &middot; {product.name}</span>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="productRevenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              contentStyle={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#productRevenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}
