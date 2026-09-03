import type { UnitOfMeasure } from '@/data/types'

/** Trims the trailing zeros a fixed-scale numeric brings back: 0.250 -> 0.25. */
function trim(value: number): string {
  return String(Number(value.toFixed(3)))
}

/**
 * A pack is stored as a quantity of the item's selling unit. What a person
 * reads is that same quantity in whichever unit of the same dimension keeps
 * it a comfortable number: 0.25 l reads as 250 ml, 1.5 kg stays 1.5 kg.
 *
 * Counted units (packs, pieces) have no smaller unit to fall back on, so
 * they are shown as they are.
 */
export function formatPack(qty: number, unitCode: string, units: UnitOfMeasure[] = []): string {
  const unit = units.find((u) => u.code === unitCode)
  if (!unit || unit.dimension === 'count') return `${trim(qty)} ${unitCode}`

  const base = qty * unit.baseFactor
  const sameDimension = units
    .filter((u) => u.dimension === unit.dimension)
    .sort((a, b) => b.baseFactor - a.baseFactor)

  // The largest unit the quantity still fills at least one of; failing that
  // the smallest, so a very small pack reads in millilitres rather than 0.
  const best = sameDimension.find((u) => base / u.baseFactor >= 1) ?? sameDimension.at(-1) ?? unit
  return `${trim(base / best.baseFactor)} ${best.code}`
}
