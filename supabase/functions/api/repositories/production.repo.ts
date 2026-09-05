import { supabase } from '../lib/supabaseClient.ts'
import type { ProductionRun, ProductionRunInput } from '../types/domain.ts'

/**
 * A production run is a header and its input lines, and the ledger entries
 * are written by a trigger when the run is posted. That ordering is what
 * makes it all-or-nothing: a failure while writing the lines leaves a draft
 * with no stock effect, never a half-recorded production.
 */
export async function record(input: ProductionRunInput, userId: string | null): Promise<number> {
  const { data: run, error: runError } = await supabase
    .from('production_runs')
    .insert({
      product_id: input.productId,
      output_qty: input.outputQty,
      note: input.note ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString(),
      created_by: userId,
    })
    .select('id')
    .single()
  if (runError) throw runError

  const runId = (run as { id: number }).id

  try {
    const { error: inputError } = await supabase
      .from('production_inputs')
      .insert(input.inputs.map((line) => ({ run_id: runId, item_id: line.itemId, qty: line.qty })))
    if (inputError) throw inputError

    // Posting is the moment the ledger moves. The trigger refuses a run with
    // no inputs, or one consuming more than is on hand.
    const { error: postError } = await supabase
      .from('production_runs')
      .update({ posted_at: new Date().toISOString() })
      .eq('id', runId)
    if (postError) throw postError
  } catch (error) {
    // An unposted draft has changed nothing, so it is safe — and tidier — to
    // drop it rather than leave it behind for someone to puzzle over.
    await supabase.from('production_runs').delete().eq('id', runId)
    throw error
  }

  return runId
}

/** On-hand for the items a run wants to consume, so it can be judged first. */
export async function stockFor(
  itemIds: string[],
): Promise<Map<string, { name: string; onHand: number; unit: string }>> {
  const { data, error } = await supabase
    .from('item_stock')
    .select('item_id, name, quantity_on_hand, stock_unit')
    .in('item_id', itemIds)
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return new Map((data as any[]).map((row) => [
    row.item_id,
    { name: row.name, onHand: Number(row.quantity_on_hand), unit: row.stock_unit },
  ]))
}

/** Runs already posted, newest first, with what each one consumed. */
export async function list(limit = 50): Promise<ProductionRun[]> {
  const { data, error } = await supabase
    .from('production_runs')
    .select(
      'id, output_qty, occurred_at, note, products(name, stock_unit), ' +
        'production_inputs(qty, products(name, stock_unit))',
    )
    .not('posted_at', 'is', null)
    .order('occurred_at', { ascending: false })
    .limit(limit)
  if (error) throw error

  // deno-lint-ignore no-explicit-any
  return (data as any[]).map((row) => ({
    id: String(row.id),
    productName: row.products?.name ?? row.product_id,
    outputQty: Number(row.output_qty),
    outputUnit: row.products?.stock_unit ?? '',
    occurredAt: row.occurred_at,
    note: row.note,
    // deno-lint-ignore no-explicit-any
    inputs: (row.production_inputs ?? []).map((line: any) => ({
      itemName: line.products?.name ?? '',
      qty: Number(line.qty),
      unit: line.products?.stock_unit ?? '',
    })),
  }))
}
