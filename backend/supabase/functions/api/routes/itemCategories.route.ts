import { Hono } from 'npm:hono@4'
import { supabase } from '../lib/supabaseClient.ts'
import type { ItemCategoryOption } from '../types/domain.ts'

/**
 * The three categories the item form offers. Served rather than hardcoded
 * in the client so their labels live in one place, next to the column that
 * references them.
 */
export const itemCategoriesRoute = new Hono()

itemCategoriesRoute.get('/', async (c) => {
  const { data, error } = await supabase
    .from('item_categories')
    .select('*')
    .order('sort_order')
  if (error) throw error

  // deno-lint-ignore no-explicit-any
  const categories: ItemCategoryOption[] = (data as any[]).map((row) => ({
    code: row.code,
    label: row.label,
    hint: row.hint,
  }))
  return c.json(categories)
})
