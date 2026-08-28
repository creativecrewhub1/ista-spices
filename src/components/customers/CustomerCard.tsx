import { Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Customer } from '@/data/types'
import { segmentConfig } from '@/lib/status'
import { formatCurrency, formatDate } from '@/lib/format'

interface CustomerCardProps {
  customer: Customer
  onOpen: (customer: Customer) => void
}

export function CustomerCard({ customer, onOpen }: CustomerCardProps) {
  const segment = segmentConfig[customer.segment]

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(customer)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(customer)}
      className="gap-2 transition-colors hover:bg-muted/50"
    >
      <CardContent className="flex items-center gap-3">
        <Avatar className="size-11 shrink-0">
          <AvatarFallback className="bg-primary/15 font-semibold text-primary">
            {customer.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{customer.name}</h3>
            <Badge variant="outline" className={segment.badgeClass}>
              {segment.label}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {customer.totalOrders} orders &middot; {formatCurrency(customer.totalSpend)} lifetime
          </p>
          <p className="text-[11px] text-muted-foreground">Last order {formatDate(customer.lastOrderAt)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          aria-label={`Call ${customer.name}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Phone className="size-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  )
}
