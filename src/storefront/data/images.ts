/*
 * Storefront image registry — the single place photography is wired in.
 *
 * HOW TO ADD OR SWAP A PHOTO
 * --------------------------
 * 1. Drop the file into `public/images/products/` (see the README there).
 * 2. Point the matching entry below at it.
 * 3. That's it — every card, gallery, cart line and search result that uses
 *    the slug picks it up.
 *
 * Nothing here is required. Any entry left as `null` falls back to the painted
 * spice-colour backdrop in <ProductVisual>, and a URL that 404s falls back the
 * same way at runtime — so a half-finished photo set never breaks a page.
 *
 * NOTE: this registry serves the storefront's own catalogue in
 * `data/products.ts`. The admin panel reads its images from the `image_url`
 * column on `products` / `inventory_items` instead, pointing at these same
 * files. When the storefront moves onto the live API the two converge and this
 * file goes away.
 */

/** Photo per product, keyed by `Product.slug`. */
export const productImages: Record<string, string | null> = {
  'sun-dried-turmeric-powder': '/images/products/turmeric.jpg',
  'kashmiri-red-chilli-powder': '/images/products/red_chilli_powder.jpg',
  'guntur-chilli-powder': '/images/products/dry_red_chilli.jpg',
  'roasted-coriander-powder': '/images/products/spice_powder.jpg',
  'signature-garam-masala': '/images/products/masala_powder.jpg',
  'south-indian-sambar-powder': null,
  'tangy-rasam-powder': null,
  'wood-pressed-groundnut-oil': '/images/products/peanut_oil.jpg',
  'virgin-coconut-oil': '/images/products/coconut_oil.jpg',
  'cold-pressed-sesame-oil': null,
  'extra-virgin-olive-oil': null,
  'single-origin-black-pepper': '/images/products/black_pepper.jpg',
  'the-everyday-essentials-set': null,
  'the-cold-pressed-oil-trio': null,
}

/** Photo per category tile, keyed by `CategoryInfo.id`. */
export const categoryImages: Record<string, string | null> = {
  'spice-powders': '/images/products/red_chilli_powder.jpg',
  blends: '/images/products/masala_powder.jpg',
  'cooking-oils': '/images/products/coconut_oil.jpg',
  'gift-sets': null,
}

/** One-off editorial slots across the site. */
export const siteImages = {
  /** Wide hero shot. Null keeps the generated lineup of the first five products. */
  heroLineup: null as string | null,
  /** "Our story" section on the home page, and the About page banner. */
  story: '/images/products/coriander.jpg' as string | null,
  /** Three lifestyle tiles in the "shop most popular" row. */
  popular: [
    '/images/products/honey.jpg',
    '/images/products/turmeric.jpg',
    '/images/products/peanut_oil.jpg',
  ] as (string | null)[],
  /** Recipe cards at the bottom of the home page. */
  recipes: [
    '/images/products/cumin.jpg',
    '/images/products/masala_powder.jpg',
    '/images/products/dry_red_chilli.jpg',
    '/images/products/spice_powder.jpg',
  ] as (string | null)[],
}

export function productImage(slug: string): string | null {
  return productImages[slug] ?? null
}

export function categoryImage(id: string): string | null {
  return categoryImages[id] ?? null
}
