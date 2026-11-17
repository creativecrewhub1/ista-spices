import { Archive, RotateCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useItemCategories } from '@/data/queries'
import type { RemovedItem } from '@/data/types'

interface RemovedItemsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: RemovedItem[]
  isLoading: boolean
  onRestore: (id: string) => void
  restoringId: string | null
  error: string | null
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Nothing is ever deleted, so this is where removed items live. It shows what
 * each one still carries — stock in the ledger, order lines pointing at it —
 * because that is the reason it was kept rather than dropped.
 */
export function RemovedItemsDialog({
  open,
  onOpenChange,
  items,
  isLoading,
  onRestore,
  restoringId,
  error,
}: RemovedItemsDialogProps) {
  const { data: categories = [] } = useItemCategories()
  const label = (code: string) => categories.find((o) => o.code === code)?.label ?? code

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="size-5 text-orange-500" aria-hidden="true" />
            Removed items
          </DialogTitle>
          <DialogDescription>
            Out of the catalogue but still on file. Restoring one puts it back exactly as it was.
          </DialogDescription>
        </DialogHeader>

        {error ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="py-8 text-center text-sm font-medium text-slate-400">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nothing has been removed.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {label(item.category)} &middot; removed {formatDate(item.removedAt)}
                    {item.removedBy ? ` by ${item.removedBy}` : ''}
                  </p>
                  {/* Why the row was kept rather than deleted. */}
                  <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                    {item.orderLines > 0
                      ? `${item.orderLines} order ${item.orderLines === 1 ? 'line' : 'lines'}`
                      : 'No orders'}
                    {item.quantityOnHand !== 0
                      ? ` · ${item.quantityOnHand} ${item.stockUnit} still in the ledger`
                      : ''}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  disabled={restoringId === item.id}
                  onClick={() => onRestore(item.id)}
                >
                  <RotateCcw className="size-3.5" aria-hidden="true" />
                  {restoringId === item.id ? 'Restoring…' : 'Restore'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
