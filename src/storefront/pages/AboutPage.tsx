import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductVisual } from '../components/ProductVisual'
import { SectionHeading } from '../components/SectionHeading'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Our Story' }]} />

      <div className="mt-6 flex flex-col gap-6">
        <h1 className="font-display text-4xl font-medium text-foreground sm:text-5xl">Our Story</h1>
        <p className="text-lg text-muted-foreground">
          Ista Spices began in 1962 in a single kitchen in Tamil Nadu, sun-drying turmeric on the terrace and
          grinding it fresh for neighbours who couldn&apos;t find the same quality in stores.
        </p>
      </div>

      <ProductVisual accent="garam-masala" className="my-10 aspect-[16/9] w-full rounded-md" iconClassName="size-12" />

      <div className="flex flex-col gap-6 text-muted-foreground">
        <p>
          Sixty years later, we still buy directly from the same farming families, dry the slow way under open
          sun, and grind in batches small enough that nothing sits on a shelf for months before it reaches you.
          Every jar that leaves our facility is ground within days of being ordered — not months in advance, sitting
          in a warehouse losing its aroma.
        </p>
        <p>
          We work with a small network of growers across Tamil Nadu, Andhra Pradesh, Kerala, and Kashmir, paying
          fair, direct prices rather than going through commodity markets. It costs more. We think it&apos;s worth
          it, and so do the families who have cooked with our spices for three generations.
        </p>
      </div>

      <SectionHeading title="Get in touch" description="Questions about an order, sourcing, or a bulk enquiry — we read every message." className="mt-16 mb-6" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-md border border-border p-5">
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="mt-1 text-sm text-muted-foreground">hello@istaspices.example</p>
        </div>
        <div className="rounded-md border border-border p-5">
          <p className="text-sm font-medium text-foreground">Phone</p>
          <p className="mt-1 text-sm text-muted-foreground">+91 98765 43210</p>
        </div>
        <div className="rounded-md border border-border p-5">
          <p className="text-sm font-medium text-foreground">Studio</p>
          <p className="mt-1 text-sm text-muted-foreground">Erode, Tamil Nadu</p>
        </div>
      </div>
    </div>
  )
}
