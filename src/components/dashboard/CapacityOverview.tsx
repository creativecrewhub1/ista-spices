import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { products } from '@/data/mock-data'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { capacityLevel } from '@/lib/status'
import { cn } from '@/lib/utils'

export function CapacityOverview() {
  const items = [...products].sort(
    (a, b) => a.unitsPackedThisBatch / a.batchCapacity - b.unitsPackedThisBatch / b.batchCapacity,
  )

  return (
    <SectionCard
      title="Stock levels by product"
      action={
        <Link to="/inventory" className="text-xs font-medium text-primary hover:underline">
          Manage products
        </Link>
      }
    >
      <ScrollArea className="h-80 pr-3">
        <ul className="flex flex-col gap-4 pb-1">
          {items.map((item) => {
            const level = capacityLevel(item.unitsPackedThisBatch, item.batchCapacity)
            const percent = Math.min(100, Math.round((item.unitsPackedThisBatch / item.batchCapacity) * 100))
            return (
              <li key={item.id}>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {item.unitsPackedThisBatch}/{item.batchCapacity}
                    </span>
                    {level === 'low' ? (
                      <Badge className="border-warning/30 bg-warning/15 text-warning">Low stock</Badge>
                    ) : level === 'high' ? (
                      <Badge className="border-success/30 bg-success/15 text-success">Well stocked</Badge>
                    ) : null}
                  </div>
                </div>
                <Progress
                  value={percent}
                  className={cn(
                    '[&>div]:transition-all',
                    level === 'low' && '[&>div]:bg-warning',
                    level === 'high' && '[&>div]:bg-success',
                  )}
                />
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </SectionCard>
  )
}
