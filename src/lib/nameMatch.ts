/**
 * Case, padding and repeated spaces are not what makes two items different.
 * Kept in step with normaliseName in the API and with the unique index on
 * products, so the form and the database agree on what counts as the same.
 */
export function normaliseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Overlapping letter triples — "turmeric" and "termeric" share most of theirs. */
function trigrams(value: string): Set<string> {
  const padded = `  ${value} `
  const out = new Set<string>()
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3))
  return out
}

/**
 * How alike two names look, 0 to 1. This is the same trigram measure
 * Postgres uses, so a typo scores high while genuinely different products
 * score low — "Turmeric Powder" against "Turmeric Fingers" is a partial
 * match, not a duplicate, which is exactly the distinction to surface
 * rather than enforce.
 */
export function similarity(a: string, b: string): number {
  const left = trigrams(normaliseName(a))
  const right = trigrams(normaliseName(b))
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const gram of left) if (right.has(gram)) shared++
  return shared / (left.size + right.size - shared)
}
