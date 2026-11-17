import { ArrowDownAZ, ArrowUpAZ, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatCompactNumber } from '@/lib/format'

interface ProductRevenueRow {
  id: string
  name: string
  revenue: number
  unitsSold: number
}

interface ProductRevenueTableProps {
  rows: ProductRevenueRow[]
  sortDirection: 'asc' | 'desc'
  onToggleSort: () => void
}

function downloadCsv(rows: ProductRevenueRow[]) {
  const header = 'Product,Units sold,Revenue\n'
  const body = rows
    .map((row) => `${row.name.replace(/,/g, ' ')},${row.unitsSold},${row.revenue}`)
    .join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'product-revenue.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export function ProductRevenueTable({ rows, sortDirection, onToggleSort }: ProductRevenueTableProps) {
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={onToggleSort} className="gap-1.5">
          {sortDirection === 'asc' ? (
            <ArrowUpAZ className="size-4" aria-hidden="true" />
          ) : (
            <ArrowDownAZ className="size-4" aria-hidden="true" />
          )}
          {sortDirection === 'asc' ? 'Lowest first' : 'Highest first'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => downloadCsv(rows)} className="gap-1.5">
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Units sold</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-[10rem]">
                  <div className="truncate font-medium">{row.name}</div>
                  <div className="mt-1 h-1 w-full max-w-24 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(4, (row.revenue / maxRevenue) * 100)}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatCompactNumber(row.unitsSold)}
                </TableCell>
                <TableCell className="text-right font-mono font-medium tabular-nums">
                  {formatCurrency(row.revenue)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
