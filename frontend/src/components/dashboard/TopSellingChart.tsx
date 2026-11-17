import { SectionCard } from './SectionCard'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { useRevenueByProduct, useProducts } from '@/data/queries'
import { productImage } from '@/lib/productImage'
import { formatCurrency, formatCompactNumber } from '@/lib/format'
import { Badge } from '@/components/ui/badge'

export function TopSellingChart() {
  const { data: productRevenue, isLoading: revLoading, error: revError } = useRevenueByProduct()
  const { data: products } = useProducts()

  if (revLoading) {
    return (
      <SectionCard title="Top 5 Selling Spices">
        <LoadingState />
      </SectionCard>
    )
  }
  if (revError) {
    return (
      <SectionCard title="Top 5 Selling Spices">
        <ErrorState message={revError.message} />
      </SectionCard>
    )
  }

  const topFive = [...(productRevenue ?? [])]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 5)

  const maxUnits = Math.max(...topFive.map((p) => p.unitsSold), 1)

  return (
    <SectionCard title="Top 5 Selling Spices">
      <div className="space-y-4">
        {topFive.map((item, index) => {
          const percent = Math.min(100, Math.round((item.unitsSold / maxUnits) * 100))
          const rank = index + 1
          const matchedProd = (products ?? []).find((p) => p.id === item.id || p.name === item.name)
          const imgUrl = productImage(matchedProd?.imageUrl)

          return (
            <div
              key={item.id}
              className="group rounded-2xl border border-slate-100/90 bg-slate-50/50 p-3.5 hover:bg-orange-50/60 hover:border-orange-200/90 transition-all duration-300 shadow-2xs hover:shadow-md hover:-translate-y-0.5 space-y-2.5"
            >
              {/* Top Row: Rank Badge, Spice Photo, Title, Units Sold & Revenue */}
              <div className="flex items-center justify-between gap-3">
                
                {/* Left: Rank, Image & Name */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <span
                    className={`flex size-6.5 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black shadow-2xs ${
                      rank === 1
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white ring-2 ring-amber-300'
                        : rank === 2
                          ? 'bg-gradient-to-tr from-slate-400 to-slate-500 text-white'
                          : rank === 3
                            ? 'bg-gradient-to-tr from-amber-700 to-amber-800 text-white'
                            : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    #{rank}
                  </span>

                  {/* Product Spice Photo */}
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="size-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0 transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Title & Units Sold Subtitle */}
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      <span className="text-orange-600 font-bold">{formatCompactNumber(item.unitsSold)}</span> units sold
                    </p>
                  </div>
                </div>

                {/* Right: Revenue Amount Tag */}
                <div className="text-right shrink-0">
                  <Badge variant="outline" className="bg-white border-orange-200 font-mono text-xs font-black text-slate-900 shadow-2xs group-hover:border-orange-400">
                    {formatCurrency(item.revenue)}
                  </Badge>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200/70 p-0.5 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 shadow-xs transition-all duration-500 ease-out group-hover:brightness-110"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
