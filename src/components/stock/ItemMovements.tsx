import { useStockMovements } from '@/data/queries'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { cn } from '@/lib/utils'

const KIND_LABELS: Record<string, string> = {
  receipt: 'Stock in',
  sale: 'Despatched',
  consumption: 'Consumed',
  production: 'Produced',
  adjustment: 'Adjusted',
}

/**
 * One item's individual movements. The row above shows the position — the
 * running total — while this shows the entries that produced it, each with
 * the batch it arrived under and what that consignment cost.
 */
export function ItemMovements({ itemId, unit }: { itemId: string; unit: string }) {
  const { data: movements, isLoading } = useStockMovements(itemId, 50)

  if (isLoading) {
    return <p className="px-4 py-4 text-xs font-medium text-slate-400">Loading entries…</p>
  }

  if (!movements?.length) {
    return <p className="px-4 py-4 text-xs font-medium text-slate-400">No entries recorded yet.</p>
  }

  return (
    <div className="overflow-x-auto px-4 py-3">
      <table className="w-full min-w-[620px] text-left text-[11px]">
        <thead>
          <tr className="text-slate-400">
            <th className="py-1.5 pr-4 font-bold uppercase tracking-wider">Batch</th>
            <th className="py-1.5 pr-4 font-bold uppercase tracking-wider">Entry</th>
            <th className="py-1.5 pr-4 font-bold uppercase tracking-wider">Date</th>
            <th className="py-1.5 pr-4 text-right font-bold uppercase tracking-wider">Qty</th>
            <th className="py-1.5 pr-4 text-right font-bold uppercase tracking-wider">Cost / unit</th>
            <th className="py-1.5 text-right font-bold uppercase tracking-wider">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movements.map((m) => (
            <tr key={m.id}>
              <td className="py-2 pr-4 font-mono text-slate-500">
                {m.batchNo ?? <span className="text-slate-300">—</span>}
              </td>
              <td className="py-2 pr-4 font-semibold text-slate-700">
                {KIND_LABELS[m.kind] ?? m.kind}
                {m.note ? <span className="ml-1.5 font-normal text-slate-400">{m.note}</span> : null}
              </td>
              <td className="py-2 pr-4 text-slate-500">{formatDateLong(m.occurredAt)}</td>
              <td
                className={cn(
                  'py-2 pr-4 text-right font-mono font-bold tabular-nums',
                  m.qty > 0 ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {m.qty > 0 ? '+' : ''}
                {m.qty} <span className="font-sans font-medium text-slate-400">{unit}</span>
              </td>
              <td className="py-2 pr-4 text-right font-mono tabular-nums text-slate-700">
                {m.unitCost !== null ? formatCurrency(m.unitCost) : <span className="text-slate-300">—</span>}
              </td>
              <td className="py-2 text-right font-mono font-bold tabular-nums text-slate-900">
                {m.unitCost !== null ? (
                  formatCurrency(Math.abs(m.qty) * m.unitCost)
                ) : (
                  <span className="text-slate-300">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
