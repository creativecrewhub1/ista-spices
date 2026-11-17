import { Hono } from 'npm:hono@4'
import { supabase } from '../lib/supabaseClient.ts'
import type { UnitOfMeasure } from '../types/domain.ts'

/**
 * The unit list the forms offer. Served from the reference table rather
 * than hardcoded in the client, so the options a user sees and the values
 * the database accepts are the same list.
 */
export const unitsRoute = new Hono()

unitsRoute.get('/', async (c) => {
  const { data, error } = await supabase
    .from('units_of_measure')
    .select('*')
    .order('sort_order')
  if (error) throw error

  // deno-lint-ignore no-explicit-any
  const units: UnitOfMeasure[] = (data as any[]).map((row) => ({
    code: row.code,
    name: row.name,
    dimension: row.dimension,
    baseFactor: Number(row.base_factor),
  }))
  return c.json(units)
})
