import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, PackageCheck, Sprout, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '../components/SectionHeading'
import { ProductCard } from '../components/ProductCard'
import { ProductVisual } from '../components/ProductVisual'
import { RatingStars } from '../components/RatingStars'
import { categories, products } from '../data/products'

const FEATURED_SLUGS = [
  'sun-dried-turmeric-powder',
  'signature-garam-masala',
  'wood-pressed-groundnut-oil',
  'virgin-coconut-oil',
]

const TRUST_POINTS = [
  { icon: Sprout, label: 'Sourced direct from farms' },
  { icon: Leaf, label: 'No fillers, no additives' },
  { icon: PackageCheck, label: 'Ground fresh to order' },
  { icon: Truck, label: 'Shipped within 48 hours' },
]

const TESTIMONIALS = [
  {
    quote: 'The colour and aroma alone tell you this is a different product. I have not bought turmeric anywhere else since.',
    author: 'Meera K., Mumbai',
  },
  {
    quote: 'Opened the garam masala jar and the smell filled my entire kitchen. My biryani has never tasted this balanced.',
    author: 'Karthik N., Bengaluru',
  },
  {
    quote: 'Grew up on wood-pressed oil at my grandparents\' home. This brought that smell back after twenty years.',
    author: 'Suresh V., Chennai',
  },
]

export function HomePage() {
  const featured = products.filter((p) => FEATURED_SLUGS.includes(p.slug))

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
              Small-batch since 1962
            </span>
            <h1 className="font-display text-4xl font-medium leading-[1.1] text-foreground sm:text-5xl lg:text-6xl">
              Spices worth <em className="not-italic text-accent">tasting</em>, from farm to jar.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Stone-ground powders and cold-pressed oils, sourced directly from growers across India and made in
              batches small enough to stay fresh.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/shop">
                  Shop the collection
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Our story</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ProductVisual accent="turmeric" className="aspect-[3/4] rounded-md" iconClassName="size-8" />
            <ProductVisual accent="chilli" className="mt-8 aspect-[3/4] rounded-md" iconClassName="size-8" />
            <ProductVisual accent="oil-gold" className="-mt-8 aspect-[3/4] rounded-md" iconClassName="size-8" />
            <ProductVisual accent="garam-masala" className="aspect-[3/4] rounded-md" iconClassName="size-8" />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-border bg-secondary">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="size-5 shrink-0 text-accent" aria-hidden="true" strokeWidth={1.5} />
              <span className="text-sm text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category discovery */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Explore" title="Shop by category" align="left" className="mb-10" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/shop?category=${category.id}`}
              className="group flex flex-col overflow-hidden rounded-md border border-border transition-colors hover:border-foreground/30"
            >
              <ProductVisual
                accent={category.accent}
                className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.03]"
                iconClassName="size-8"
              />
              <div className="flex flex-col gap-1 p-4">
                <h3 className="text-base font-medium text-foreground">{category.label}</h3>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Loved by our customers"
            title="Bestsellers"
            action={
              <Button asChild variant="ghost" className="gap-1.5">
                <Link to="/shop">
                  View all <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            }
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Editorial story section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductVisual accent="pepper" className="aspect-[4/3] rounded-md" iconClassName="size-10" />
          <div className="flex flex-col gap-5">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-accent">Our story</span>
            <h2 className="font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">
              Three generations of one family, still grinding by hand-picked batch.
            </h2>
            <p className="text-muted-foreground">
              Ista Spices began in a single kitchen in Tamil Nadu, sun-drying turmeric on the terrace and grinding
              it fresh for neighbours who couldn&apos;t find the same quality in stores. Sixty years later, we
              still buy directly from the same farming families, dry the slow way, and grind in batches small
              enough that nothing sits on a shelf for months before it reaches you.
            </p>
            <div>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/about">
                  Read the full story <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Reviews" title="What people are cooking with" align="center" className="mb-10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.author} className="flex flex-col gap-4 rounded-md border border-border bg-background p-6">
                <RatingStars rating={5} />
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="text-xs text-muted-foreground">{t.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">
          Bring farm-fresh spice to your kitchen.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Free shipping on orders over &#8377;999. Small batches, ground to order, delivered within days.
        </p>
        <Button asChild size="lg" className="mt-6 gap-2">
          <Link to="/shop">
            Start shopping <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
