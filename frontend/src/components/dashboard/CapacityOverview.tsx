import { Link } from 'react-router-dom'
import { ChevronRight, AlertTriangle } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { useProducts } from '@/data/queries'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { stockLevelConfig } from '@/lib/status'
import { productImage } from '@/lib/productImage'
import { cn } from '@/lib/utils'

export function CapacityOverview() {
  const { data: products, isLoading, error } = useProducts()

  if (isLoading) {
    return (
      <SectionCard title="Stock Levels by Spice Product">
        <LoadingState />
      </SectionCard>
    )
  }
  if (error) {
    return (
      <SectionCard title="Stock Levels by Spice Product">
        <ErrorState message={error.message} />
      </SectionCard>
    )
  }

  // "Well stocked" is three times the low mark, the same line the badge uses.
  const headroom = (item: { unitsPackedThisBatch: number; lowStockThreshold: number }) =>
    item.lowStockThreshold > 0
      ? item.unitsPackedThisBatch / (item.lowStockThreshold * 3)
      : Number.POSITIVE_INFINITY

  const items = [...(products ?? [])].sort((a, b) => headroom(a) - headroom(b))

  return (
    <SectionCard
      title="Stock Levels by Spice Product"
      action={
        <Link
          to="/inventory"
          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
        >
          <span>Manage Catalogue</span>
          <ChevronRight className="size-3.5" />
        </Link>
      }
    >
      <ScrollArea className="h-88 pr-2">
        <div className="space-y-3.5 pb-2">
          {items.map((item) => {
            const levelBadge = stockLevelConfig[item.stockLevel]
            const percent = Math.min(100, Math.round(headroom(item) * 100))
            const isLowStock = item.stockLevel === 'low'
            const imgUrl = productImage(item.imageUrl)

            return (
              <div
                key={item.id}
                className={cn(
                  'group rounded-2xl border p-3.5 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 space-y-2.5',
                  isLowStock
                    ? 'border-rose-200/90 bg-rose-50/40 hover:bg-rose-50/70'
                    : 'border-slate-100/90 bg-slate-50/50 hover:bg-orange-50/60 hover:border-orange-200/90',
                )}
              >
                {/* Top Row: Spice Photo, Title, Units Ratio & Status Badge */}
                <div className="flex items-center justify-between gap-3">
                  
                  {/* Left: Image, Title & Ratio */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={imgUrl}
                      alt={item.name}
                      className="size-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-110"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {item.name}
                        </p>
                        {isLowStock && <AlertTriangle className="size-3.5 text-rose-500 shrink-0" />}
                      </div>

                      <p className="text-[11px] font-semibold text-slate-500 font-mono">
                        <span className="font-bold text-slate-900">{item.unitsPackedThisBatch}</span> {item.stockUnit} in stock
                        {item.lowStockThreshold > 0 ? ` · low at ${item.lowStockThreshold}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Right: Stock Level Badge & Completion Tag */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-black text-slate-700 bg-white/80 px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                      {percent}%
                    </span>

                    {levelBadge ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          'px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs transition-transform duration-300 group-hover:scale-105',
                          levelBadge.badgeClass,
                        )}
                      >
                        {levelBadge.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200/70 p-0.5 shadow-inner">
                  <div
                    className={cn(
                      'h-full rounded-full shadow-xs transition-all duration-500 ease-out group-hover:brightness-110',
                      isLowStock
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                        : 'bg-gradient-to-r from-orange-500 to-emerald-500',
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </SectionCard>
  )
}
