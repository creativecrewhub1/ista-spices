import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <Fragment key={item.label}>
          {index > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" /> : null}
          {item.to ? (
            <Link to={item.to} className="truncate transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-foreground" aria-current="page">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
