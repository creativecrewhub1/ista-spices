/** Neutral stand-in for a product with no photo on file. */
const PRODUCT_IMAGE_FALLBACK = '/images/products/masala_powder.jpg'

/**
 * Resolves a product thumbnail from the image stored against the product.
 * Never infers one from the product's name — name-matching silently showed
 * the wrong photo (groundnut oil rendered as coconut oil).
 */
export function productImage(imageUrl: string | null | undefined): string {
  return imageUrl?.trim() ? imageUrl : PRODUCT_IMAGE_FALLBACK
}
