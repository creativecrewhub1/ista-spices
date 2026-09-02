import { Clock, PackageX, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { useNeedsAttention } from '@/data/queries'
import { formatTime } from '@/lib/format'

export function NeedsAttention() {
  const { data, isLoading, error } = useNeedsAttention()

  if (isLoading) {
    return (
      <SectionCard title="Needs attention">
        <LoadingState />
      </SectionCard>
    )
  }
  if (error) {
    return (
      <SectionCard title="Needs attention">
        <ErrorState message={error.message} />
      </SectionCard>
    )
  }

  const items = data?.items ?? []

  return (
    <SectionCard title="Needs attention">
      {items.length === 0 ? (
        <p className="py-2 text-sm font-semibold text-slate-500">All clear — nothing needs action right now.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((item) => {
            const isLate = item.kind === 'late-order'
            const Icon = isLate ? Clock : PackageX
            const text = isLate
              ? `${item.orderId} for ${item.customerName} is past ETA`
              : `${item.productName} is running low on stock`
            const meta = isLate
              ? `Expected by ${formatTime(item.eta)}`
              : `${item.unitsInHand}/${item.batchCapacity} units in hand`

            return (
              <li key={item.id}>
                <Link
                  to={item.linkTo}
                  className="group flex items-center justify-between gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-300 hover:bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={
                        isLate
                          ? 'flex size-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-xs group-hover:scale-110 transition-transform'
                          : 'flex size-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-700 shadow-xs group-hover:scale-110 transition-transform'
                      }
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{text}</span>
                      <span className="block text-xs font-semibold text-slate-500">{meta}</span>
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <span>Resolve</span>
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
