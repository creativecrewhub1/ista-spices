import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, PackageCheck, Sprout, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '../components/SectionHeading'
import { ProductCard } from '../components/ProductCard'
import { ProductVisual } from '../components/ProductVisual'
import { RatingStars } from '../components/RatingStars'
import { PriceTag } from '../components/PriceTag'
import { categories, products } from '../data/products'
import { categoryImage, productImage, siteImages } from '../data/images'

const FEATURED_SLUGS = [
  'sun-dried-turmeric-powder',
  'signature-garam-masala',
  'wood-pressed-groundnut-oil',
  'virgin-coconut-oil',
]

/* The reference leads with press logos as social proof. Until real coverage
   exists these are the credentials the brand actually has — same slot, same
   job, no invented endorsements. */
const CREDENTIALS = [
  'Est. 1962',
  'Direct from 40+ farms',
  'Ground to order',
  'No fillers, ever',
  '12,000+ kitchens',
]

const POPULAR = [
  { label: 'Gifts & Collections', to: '/shop?category=gift-sets', accent: 'garam-masala' as const },
  { label: 'Everyday Powders', to: '/shop?category=spice-powders', accent: 'turmeric' as const },
  { label: 'Cold-Pressed Oils', to: '/shop?category=cooking-oils', accent: 'oil-gold' as const },
]

const WHY_US = [
  {
    icon: Sprout,
    title: '100% Pure Spice',
    body: 'Nothing but the spice itself — no fillers, no anti-caking agents, no added colour. What is on the label is what is in the jar.',
  },
  {
    icon: Leaf,
    title: 'Sourced Direct From Farms',
    body: 'We buy from the same forty growing families year after year, at prices agreed before harvest, with no middlemen in between.',
  },
  {
    icon: PackageCheck,
    title: 'Ground Fresh To Order',
    body: 'Stone-ground in batches small enough that nothing sits in a warehouse. Most orders are milled the week they ship.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'The colour and aroma alone tell you this is a different product. I have not bought turmeric anywhere else since.',
    author: 'Meera K.',
    city: 'Mumbai',
  },
  {
    quote: 'Opened the garam masala jar and the smell filled my entire kitchen. My biryani has never tasted this balanced.',
    author: 'Karthik N.',
    city: 'Bengaluru',
  },
  {
    quote: 'Grew up on wood-pressed oil at my grandparents’ home. This brought that smell back after twenty years.',
    author: 'Suresh V.',
    city: 'Chennai',
  },
  {
    quote: 'Ordered the essentials set as a housewarming gift and ended up keeping it. Bought two more since.',
    author: 'Anjali R.',
    city: 'Pune',
  },
]

const RECIPES = [
  { title: 'Everyday dal with a turmeric tadka', minutes: 25, accent: 'turmeric' as const },
  { title: 'Chicken biryani, the slow way', minutes: 90, accent: 'garam-masala' as const },
  { title: 'Rasam that actually tastes like home', minutes: 30, accent: 'chilli' as const },
  { title: 'Coconut oil sautéed greens', minutes: 15, accent: 'oil-green' as const },
]

export function HomePage() {
  const featured = products.filter((p) => FEATURED_SLUGS.includes(p.slug))
  const bundle = products.find((p) => p.slug === 'the-everyday-essentials-set')
  const lineup = products.slice(0, 5)

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero
          A full-bleed coloured studio band rather than a white cutout — the
          single biggest thing separating the reference from a stock theme. */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#1F8A8C' }}>
        <div className="mx-auto max-w-7xl px-4 pb-0 pt-14 text-center sm:px-6 lg:px-8 lg:pt-20">
          <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-white/80">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
            1,200+ five-star reviews
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            Small-batch quality, directly sourced from Indian farms
          </h1>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link to="/shop">
                Shop now
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/about">Our story</Link>
            </Button>
          </div>

          {/* The product lineup sits ON the backdrop, bleeding off the bottom
              edge — a shelf, not a floating grid. */}
          <div className="mt-12 flex items-end justify-center gap-3 sm:gap-5">
            {siteImages.heroLineup ? (
              <img
                src={siteImages.heroLineup}
                alt="The Ista Spices range"
                className="max-h-[22rem] w-full max-w-4xl object-contain"
              />
            ) : (
              lineup.map((p, i) => (
                <ProductVisual
                  key={p.id}
                  accent={p.accent}
                  src={productImage(p.slug)}
                  alt={p.name}
                  fit="contain"
                  backdrop="accent"
                  className={
                    'w-[16%] max-w-32 rounded-t-xl shadow-xl sm:w-[15%] ' +
                    (i === 2 ? 'aspect-[2/3.4]' : i % 2 === 0 ? 'aspect-[2/3]' : 'aspect-[2/3.2]')
                  }
                  iconClassName="size-6"
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Credentials */}
      <section className="band-cream border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
          {CREDENTIALS.map((c) => (
            <span
              key={c}
              className="font-display text-sm font-medium uppercase tracking-[0.12em] text-primary/70 sm:text-base"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- Shop most popular */}
      <section className="band-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-9 text-center font-display text-3xl font-medium text-primary sm:text-4xl">
            Shop Most Popular
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {POPULAR.map((tile, i) => (
              <Link key={tile.label} to={tile.to} className="group flex flex-col items-center gap-4">
                <ProductVisual
                  accent={tile.accent}
                  src={siteImages.popular[i]}
                  alt={tile.label}
                  className="aspect-[4/3] w-full rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  iconClassName="size-9"
                />
                <span className="text-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-[6px]">
                  {tile.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Why choose us */}
      <section className="band-sand">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-11 text-center font-display text-3xl font-medium text-primary sm:text-4xl">
            Why Choose Ista Spices?
          </h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {WHY_US.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-primary/25 text-primary">
                  <Icon className="size-7" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold uppercase tracking-wide text-primary">{title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link to="/about">Upgrade my spice rack</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Welcome offer */}
      {bundle ? (
        <section className="band-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-medium text-foreground sm:text-4xl">Welcome Offer</h2>
              <p className="mt-2 text-muted-foreground">
                20% off plus free shipping on your first order.
              </p>
            </div>

            <div className="mt-9 grid grid-cols-1 items-center gap-8 rounded-3xl border border-border bg-background p-6 sm:grid-cols-2 sm:p-8">
              <ProductVisual
                accent={bundle.accent}
                src={productImage(bundle.slug)}
                alt={bundle.name}
                fit="contain"
                backdrop="teal"
                className="aspect-[4/3] w-full rounded-2xl"
                iconClassName="size-12"
              />
              <div className="flex flex-col gap-4">
                <h3 className="font-display text-2xl font-medium text-foreground">{bundle.name}</h3>
                <div className="flex items-center gap-3">
                  <PriceTag price={bundle.variants[0].price} size="lg" />
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    Save 20%
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{bundle.tagline}</p>
                <div className="grid grid-cols-3 gap-3 border-y border-border py-4 text-center text-xs text-muted-foreground">
                  <span>Welcome offer</span>
                  <span>20% off</span>
                  <span>Free shipping</span>
                </div>
                <Button asChild size="lg" className="gap-2">
                  <Link to={`/product/${bundle.slug}`}>
                    Claim the offer <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* -------------------------------------------------------- Bestsellers */}
      <section className="band-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Most loved"
            title="Our Bestsellers"
            description="Handpicked by our team, cooked with in thousands of kitchens across India."
            align="center"
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/shop">
                View all products <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Category tiles */}
      <section className="band-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Explore" title="Shop by category" align="center" className="mb-10" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-lg"
              >
                <ProductVisual
                  accent={category.accent}
                  src={categoryImage(category.id)}
                  alt={category.label}
                  className="aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.04]"
                  iconClassName="size-8"
                />
                <div className="flex flex-col gap-1 p-5">
                  <h3 className="text-base font-semibold text-foreground">{category.label}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Our story */}
      <section className="band-sand">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <ProductVisual
              accent="pepper"
              src={siteImages.story}
              alt="Sun-drying turmeric on the family farm"
              className="aspect-[4/3] w-full rounded-3xl"
              iconClassName="size-12"
            />
            <div className="flex flex-col gap-5">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Our story</span>
              <h2 className="font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">
                Three generations of one family, still grinding batch by batch.
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                Ista Spices began in a single kitchen in Tamil Nadu, sun-drying turmeric on the terrace and
                grinding it fresh for neighbours who couldn&apos;t find the same quality in stores. Sixty years
                later, we still buy directly from the same farming families, dry the slow way, and grind in
                batches small enough that nothing sits on a shelf for months before it reaches you.
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
        </div>
      </section>

      {/* ------------------------------------------------------ Testimonials */}
      <section className="band-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-display text-3xl font-medium text-foreground sm:text-4xl">
            Thousands love Ista Spices
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.author}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <RatingStars rating={5} />
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.author}</span> · {t.city}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Recipes */}
      <section className="band-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="From the kitchen"
            title="Cook something with it"
            align="center"
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {RECIPES.map((recipe, i) => (
              <article key={recipe.title} className="group flex flex-col gap-3">
                <ProductVisual
                  accent={recipe.accent}
                  src={siteImages.recipes[i]}
                  alt={recipe.title}
                  className="aspect-[4/3] w-full rounded-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                  iconClassName="size-8"
                />
                <h3 className="text-sm font-medium leading-snug text-foreground">{recipe.title}</h3>
                <p className="text-xs text-muted-foreground">{recipe.minutes} minutes</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Bottom CTA */}
      <section className="band-ink">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-medium sm:text-4xl">Need Ista in your kitchen tonight?</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Free shipping on orders over &#8377;999. Small batches, ground to order, delivered within days.
          </p>
          <Button asChild size="lg" className="mt-7 gap-2">
            <Link to="/shop">
              Start shopping <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
