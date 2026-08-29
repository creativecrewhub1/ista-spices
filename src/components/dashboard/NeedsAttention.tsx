import { Clock, PackageX } from 'lucide-react'
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
        <p className="py-2 text-sm text-muted-foreground">All clear — nothing needs action right now.</p>
      ) : (
        <ul className="flex flex-col gap-1">
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
                  className="flex items-start gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted"
                >
                  <span
                    className={
                      isLate
                        ? 'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive'
                        : 'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning'
                    }
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{text}</span>
                    <span className="block text-xs text-muted-foreground">{meta}</span>
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
