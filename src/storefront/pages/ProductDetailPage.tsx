import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Heart, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductVisual } from '../components/ProductVisual'
import { RatingStars } from '../components/RatingStars'
import { PriceTag } from '../components/PriceTag'
import { QuantityStepper } from '../components/QuantityStepper'
import { ProductCard } from '../components/ProductCard'
import { getProductBySlug, getRelatedProducts, categories } from '../data/products'
import { reviewsForProduct } from '../data/reviews'
import { useCart } from '../cart/CartContext'
import { useWishlist } from '../wishlist/WishlistContext'
import { cn } from '@/lib/utils'

const SPICE_LEVEL_LABEL: Record<string, string> = { mild: 'Mild', medium: 'Medium', hot: 'Hot' }

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? getProductBySlug(slug) : undefined

  const [variantId, setVariantId] = useState(product?.variants[0]?.id ?? '')
  const [qty, setQty] = useState(1)
  const [activeThumb, setActiveThumb] = useState(0)

  const { addItem } = useCart()
  const { has, toggle } = useWishlist()

  const reviews = useMemo(() => (product ? reviewsForProduct(product.id) : []), [product])
  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product])

  if (!product) return <Navigate to="/shop" replace />

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0]
  const category = categories.find((c) => c.id === product.category)
  const isWishlisted = has(product.id)

  function handleAddToCart() {
    addItem(product!, variant, qty)
    toast.success(`Added ${qty} × ${product!.name} (${variant.label}) to cart`)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: category?.label ?? 'Shop', to: `/shop?category=${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <ProductVisual accent={product.accent} className="aspect-square w-full rounded-md" iconClassName="size-16" />
          <div className="flex gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveThumb(i)}
                className={cn(
                  'flex-1 overflow-hidden rounded-md border-2 transition-colors',
                  activeThumb === i ? 'border-foreground' : 'border-transparent',
                )}
                aria-label={`View image ${i + 1}`}
                aria-current={activeThumb === i}
              >
                <ProductVisual accent={product.accent} className="aspect-square w-full" iconClassName="size-6" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            {product.badges.length > 0 ? (
              <div className="flex gap-1.5">
                {product.badges.map((b) => (
                  <Badge key={b} className="capitalize">
                    {b}
                  </Badge>
                ))}
              </div>
            ) : null}
            <h1 className="font-display text-3xl font-medium text-foreground sm:text-4xl">{product.name}</h1>
            <p className="text-muted-foreground">{product.tagline}</p>
          </div>

          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} size="md" />
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
              {product.reviewCount} reviews
            </a>
          </div>

          <PriceTag price={variant.price} size="lg" />

          <Separator />

          <div className="flex flex-col gap-2.5">
            <Label className="text-sm font-medium text-foreground">
              Pack size: <span className="font-normal text-muted-foreground">{variant.label}</span>
            </Label>
            <RadioGroup
              value={variantId}
              onValueChange={setVariantId}
              className="flex flex-wrap gap-2"
            >
              {product.variants.map((v) => (
                <div key={v.id}>
                  <RadioGroupItem value={v.id} id={`variant-${v.id}`} className="peer sr-only" />
                  <Label
                    htmlFor={`variant-${v.id}`}
                    className="flex cursor-pointer items-center rounded-md border border-border px-4 py-2 text-sm text-foreground transition-colors peer-data-[state=checked]:border-foreground peer-data-[state=checked]:bg-foreground peer-data-[state=checked]:text-primary-foreground"
                  >
                    {v.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {product.spiceLevel ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Spice level:</span> {SPICE_LEVEL_LABEL[product.spiceLevel]}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantityStepper value={qty} onChange={setQty} />
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={!product.inStock}>
              <Plus className="size-4" aria-hidden="true" />
              {product.inStock ? 'Add to cart' : 'Out of stock'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="sm:w-auto"
              onClick={() => toggle(product.id)}
              aria-pressed={isWishlisted}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={cn('size-4', isWishlisted && 'fill-accent text-accent')} aria-hidden="true" />
            </Button>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-border p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-accent" aria-hidden="true" />
              Free shipping on orders over &#8377;999 — dispatched within 48 hours.
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="size-4 shrink-0 text-accent" aria-hidden="true" />
              Not satisfied? Return within 7 days for a full refund.
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
              Sourced from {product.origin}.
            </div>
          </div>

          <Accordion type="single" collapsible defaultValue="description">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>{product.description}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="story">
              <AccordionTrigger>Sourcing & story</AccordionTrigger>
              <AccordionContent>{product.story}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping & returns</AccordionTrigger>
              <AccordionContent>
                Orders are packed and dispatched within 48 hours. Delivery typically takes 3–6 business days
                depending on location. If you&apos;re not satisfied, return the unused portion within 7 days of
                delivery for a full refund.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Reviews */}
      <section id="reviews" className="mt-20 border-t border-border pt-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-16">
          <div className="flex flex-col items-start gap-3 lg:w-64 lg:shrink-0">
            <h2 className="font-display text-2xl font-medium text-foreground">Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="font-display text-3xl text-foreground">{product.rating}</span>
              <div className="flex flex-col">
                <RatingStars rating={product.rating} />
                <span className="text-xs text-muted-foreground">{product.reviewCount} ratings</span>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Write a review
            </Button>
          </div>

          <div className="flex-1">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No written reviews yet for this product.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {reviews.map((review) => (
                  <li key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={review.rating} />
                        {review.verified ? (
                          <Badge variant="outline" className="text-[10px]">
                            Verified purchase
                          </Badge>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{review.title}</p>
                    <p className="text-sm text-muted-foreground">{review.body}</p>
                    <p className="text-xs text-muted-foreground">— {review.author}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 ? (
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="mb-8 font-display text-2xl font-medium text-foreground">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8">
        <Button variant="link" asChild className="gap-1.5 px-0">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    </div>
  )
}
