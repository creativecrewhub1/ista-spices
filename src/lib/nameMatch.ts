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
 * How alike two names look, 0 to 1. Used only by matchNames below. This is the same trigram measure
 * Postgres uses, so a typo scores high while genuinely different products
 * score low — "Turmeric Powder" against "Turmeric Fingers" is a partial
 * match, not a duplicate, which is exactly the distinction to surface
 * rather than enforce.
 */
function similarity(a: string, b: string): number {
  const left = trigrams(normaliseName(a))
  const right = trigrams(normaliseName(b))
  if (left.size === 0 || right.size === 0) return 0
  let shared = 0
  for (const gram of left) if (right.has(gram)) shared++
  return shared / (left.size + right.size - shared)
}

/**
 * Only used when nothing on file contains what was typed, to catch a
 * misspelling. Set high on purpose: at 0.4 "Black Peppercorns" scored 0.44
 * against "Black Pepper Powder 1" and was offered as a match for it.
 */
const TYPO_MATCH = 0.6

/**
 * Names that answer what has been typed, best first.
 *
 * Ordinary autocomplete carries almost all of it: anything containing the
 * text, whichever matches earliest. Similarity only steps in when nothing
 * contains it, so a misspelling still finds its item without every
 * near-relation crowding in behind it.
 */
export function matchNames<T extends { name: string }>(
  items: T[],
  typed: string,
  limit = 6,
): T[] {
  const wanted = normaliseName(typed)
  if (wanted.length < 2) return []

  const contains = items
    .map((item) => ({ item, at: normaliseName(item.name).indexOf(wanted) }))
    .filter((match) => match.at >= 0)
    .sort((a, b) => a.at - b.at || a.item.name.length - b.item.name.length)
    .map((match) => match.item)

  if (contains.length > 0) return contains.slice(0, limit)

  return items
    .map((item) => ({ item, score: similarity(item.name, typed) }))
    .filter((match) => match.score >= TYPO_MATCH)
    .sort((a, b) => b.score - a.score)
    .map((match) => match.item)
    .slice(0, limit)
}
