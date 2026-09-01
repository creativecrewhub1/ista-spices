/*
 * Storefront image registry — the single place photography is wired in.
 *
 * HOW TO ADD YOUR PHOTOS
 * ----------------------
 * 1. Drop the file into `public/images/products/` or `public/images/site/`.
 * 2. Point the matching entry below at it, e.g.
 *      'sun-dried-turmeric-powder': '/images/products/turmeric.jpg'
 * 3. That's it — every card, gallery, and hero that uses the slug picks it up.
 *
 * Nothing here is required. Any entry left as `null` falls back to the painted
 * spice-colour backdrop in <ProductVisual>, and a URL that 404s falls back the
 * same way at runtime — so a half-finished photo set never breaks a page.
 *
 * Shooting notes (this is the Rumi Spice look we're matching): shoot the pack
 * straight-on against ONE flat colour sheet — teal, deep saffron or clay — with
 * soft light and a little shadow under the jar. Same sheet, same angle, same
 * distance for every product. The consistency is what reads as premium; the
 * camera matters far less than the backdrop matching across the set.
 */

/** Photo per product, keyed by `Product.slug`. */
export const productImages: Record<string, string | null> = {
  'sun-dried-turmeric-powder': null,
  'kashmiri-red-chilli-powder': null,
  'guntur-chilli-powder': null,
  'roasted-coriander-powder': null,
  'signature-garam-masala': null,
  'south-indian-sambar-powder': null,
  'tangy-rasam-powder': null,
  'wood-pressed-groundnut-oil': null,
  'virgin-coconut-oil': null,
  'cold-pressed-sesame-oil': null,
  'extra-virgin-olive-oil': null,
  'single-origin-black-pepper': null,
  'the-everyday-essentials-set': null,
  'the-cold-pressed-oil-trio': null,
}

/** Photo per category tile, keyed by `CategoryInfo.id`. */
export const categoryImages: Record<string, string | null> = {
  'spice-powders': null,
  blends: null,
  'cooking-oils': null,
  'gift-sets': null,
}

/** One-off editorial slots across the site. */
export const siteImages = {
  /** Wide hero shot — the full product lineup on a coloured backdrop. */
  heroLineup: null as string | null,
  /** Portrait/landscape shot for the "our story" section. */
  story: null as string | null,
  /** Three lifestyle tiles in the "shop most popular" row. */
  popular: [null, null, null] as (string | null)[],
  /** Recipe cards at the bottom of the home page. */
  recipes: [null, null, null, null] as (string | null)[],
}

export function productImage(slug: string): string | null {
  return productImages[slug] ?? null
}

export function categoryImage(id: string): string | null {
  return categoryImages[id] ?? null
}
