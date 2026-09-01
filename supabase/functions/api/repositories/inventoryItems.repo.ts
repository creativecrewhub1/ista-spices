import { supabase } from '../lib/supabaseClient.ts'
import type { InventoryItem } from '../types/domain.ts'

// deno-lint-ignore no-explicit-any
function mapRow(row: any): InventoryItem {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    description: row.description ?? '',
    unit: row.unit,
    quantityOnHand: Number(row.quantity_on_hand),
    lowStockThreshold: Number(row.low_stock_threshold),
    isActive: row.is_active,
    imageUrl: row.image_url ?? null,
  }
}

export async function listActive(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data.map(mapRow)
}

export async function upsert(item: InventoryItem): Promise<void> {
  const { error } = await supabase.from('inventory_items').upsert({
    id: item.id,
    type: item.type,
    name: item.name,
    description: item.description,
    unit: item.unit,
    quantity_on_hand: item.quantityOnHand,
    low_stock_threshold: item.lowStockThreshold,
    is_active: item.isActive,
    image_url: item.imageUrl,
  })
  if (error) throw error
}

export async function softDelete(id: string): Promise<void> {
  const { error } = await supabase.from('inventory_items').update({ is_active: false }).eq('id', id)
  if (error) throw error
}
