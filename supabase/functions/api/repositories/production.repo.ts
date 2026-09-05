import { supabase } from '../lib/supabaseClient.ts'
import type { ProductionRun, ProductionRunInput, StockLayer } from '../types/domain.ts'

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

/**
 * Every batch of these items that still has stock in it, oldest first.
 * FIFO is only meaningful in that order, so it is imposed here rather than
 * left to whoever calls.
 */
export async function layersFor(itemIds: string[]): Promise<Map<string, StockLayer[]>> {
  const { data, error } = await supabase
    .from('stock_layers')
    .select('movement_id, item_id, batch_no, occurred_at, remaining_qty, unit_cost')
    .in('item_id', itemIds)
    .gt('remaining_qty', 0)
    .order('occurred_at', { ascending: true })
    .order('movement_id', { ascending: true })
  if (error) throw error

  const byItem = new Map<string, StockLayer[]>()
  // deno-lint-ignore no-explicit-any
  for (const row of data as any[]) {
    const layer: StockLayer = {
      movementId: String(row.movement_id),
      batchNo: row.batch_no ?? null,
      occurredAt: row.occurred_at,
      remainingQty: Number(row.remaining_qty),
      unitCost: row.unit_cost === null ? null : Number(row.unit_cost),
    }
    const list = byItem.get(row.item_id)
    if (list) list.push(layer)
    else byItem.set(row.item_id, [layer])
  }
  return byItem
}

/** Names and units for the items being costed, so the breakdown reads. */
export async function namesFor(
  itemIds: string[],
): Promise<Map<string, { name: string; unit: string }>> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_unit')
    .in('id', itemIds)
  if (error) throw error
  // deno-lint-ignore no-explicit-any
  return new Map((data as any[]).map((row) => [row.id, { name: row.name, unit: row.stock_unit }]))
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
