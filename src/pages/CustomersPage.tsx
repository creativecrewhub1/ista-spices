import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CustomerCard } from '@/components/customers/CustomerCard'
import { CustomerDetailSheet } from '@/components/customers/CustomerDetailSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { useCustomers, useOrders } from '@/data/queries'
import type { Customer, CustomerSegment } from '@/data/types'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type FilterValue = 'all' | CustomerSegment

export function CustomersPage() {
  const { data: customers, isLoading, error } = useCustomers()
  const { data: orders } = useOrders()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const filteredCustomers = useMemo(() => {
    return (customers ?? []).filter((customer) => {
      const matchesQuery =
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.includes(query)
      const matchesFilter = filter === 'all' || customer.segment === filter
      return matchesQuery && matchesFilter
    })
  }, [customers, query, filter])

  return (
    <div className={cn('pb-8', pageEnter)}>
      <TopBar title="Customers" subtitle={`${customers?.length ?? 0} total customers`} />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="pl-9"
            aria-label="Search customers"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="regular">Regular</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <CardListSkeleton />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : filteredCustomers.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No customers match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} onOpen={setSelectedCustomer} />
            ))}
          </div>
        )}
      </div>

      <CustomerDetailSheet
        customer={selectedCustomer}
        orders={orders ?? []}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
      />
    </div>
  )
}
