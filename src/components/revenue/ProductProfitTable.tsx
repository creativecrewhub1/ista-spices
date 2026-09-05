import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatCompactNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MonthlyProfit } from '@/data/types'

interface ProductProfitTableProps {
  profit: MonthlyProfit
}

/** A loss reads differently from a thin margin, so it is coloured as one. */
function Money({ value, emphasise = false }: { value: number; emphasise?: boolean }) {
  return (
    <span
      className={cn(
        'font-mono tabular-nums',
        emphasise && 'font-semibold',
        value < 0 && 'text-destructive',
      )}
    >
      {formatCurrency(value)}
    </span>
  )
}

export function ProductProfitTable({ profit }: ProductProfitTableProps) {
  if (profit.products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        Nothing was sold in this month.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Units</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Material cost</TableHead>
            <TableHead className="text-right">Gross profit</TableHead>
            <TableHead className="text-right">Misc. share</TableHead>
            <TableHead className="text-right">Net profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profit.products.map((row) => (
            <TableRow key={row.productId}>
              <TableCell className="max-w-[12rem] truncate font-medium">
                {row.productName}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {formatCompactNumber(row.unitsSold)}
              </TableCell>
              <TableCell className="text-right"><Money value={row.revenue} /></TableCell>
              <TableCell className="text-right"><Money value={row.materialCost} /></TableCell>
              <TableCell className="text-right"><Money value={row.grossProfit} /></TableCell>
              <TableCell className="text-right"><Money value={row.overhead} /></TableCell>
              <TableCell className="text-right"><Money value={row.netProfit} emphasise /></TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-medium">Month total</TableCell>
            <TableCell />
            <TableCell className="text-right"><Money value={profit.totals.revenue} /></TableCell>
            <TableCell className="text-right"><Money value={profit.totals.materialCost} /></TableCell>
            <TableCell className="text-right"><Money value={profit.totals.grossProfit} /></TableCell>
            <TableCell className="text-right"><Money value={profit.totals.overhead} /></TableCell>
            <TableCell className="text-right"><Money value={profit.totals.netProfit} emphasise /></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
