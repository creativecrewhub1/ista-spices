import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/format'
import { useAddMonthlyExpense, useDeleteMonthlyExpense } from '@/data/mutations'
import type { MonthlyExpense } from '@/data/types'

interface MonthlyExpensesPanelProps {
  month: string
  expenses: MonthlyExpense[]
  total: number
}

/**
 * Running costs for the month — packaging, gas, labels, anything that was
 * paid for but cannot be pinned to one product. They are entered here and
 * shared out across products in proportion to what each earned.
 */
export function MonthlyExpensesPanel({ month, expenses, total }: MonthlyExpensesPanelProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')

  const addExpense = useAddMonthlyExpense()
  const deleteExpense = useDeleteMonthlyExpense()

  const parsedAmount = Number(amount)
  const canAdd =
    description.trim().length > 0 && amount.trim().length > 0 &&
    Number.isFinite(parsedAmount) && parsedAmount >= 0

  function submit() {
    if (!canAdd) return
    addExpense.mutate(
      { month, description: description.trim(), amount: parsedAmount },
      {
        onSuccess: () => {
          setDescription('')
          setAmount('')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-description">What was it for</Label>
          <Input
            id="expense-description"
            value={description}
            placeholder="Packaging, gas, courier…"
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-amount">Amount</Label>
          <Input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={amount}
            placeholder="0"
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit()
            }}
          />
        </div>

        <Button onClick={submit} disabled={!canAdd || addExpense.isPending} className="gap-1.5">
          <Plus className="size-4" aria-hidden="true" />
          {addExpense.isPending ? 'Adding…' : 'Add'}
        </Button>
      </div>

      {addExpense.error ? (
        <p className="text-sm text-destructive">{addExpense.error.message}</p>
      ) : null}

      {expenses.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing recorded for this month yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm">{expense.description}</span>
              <span className="font-mono text-sm tabular-nums">
                {formatCurrency(expense.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${expense.description}`}
                disabled={deleteExpense.isPending}
                onClick={() => deleteExpense.mutate({ id: expense.id, month })}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
          <li className="flex items-center gap-3 bg-muted/40 px-4 py-2.5">
            <span className="min-w-0 flex-1 text-sm font-medium">Total for the month</span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {formatCurrency(total)}
            </span>
            {/* Keeps the total aligned with the rows above it, which each
                end in an icon button. */}
            <span className="size-9" aria-hidden="true" />
          </li>
        </ul>
      )}
    </div>
  )
}
