import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export function SpicestAbout() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24 bg-[#fffaf3] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#241a14] shadow-[0_22px_55px_rgba(56,33,20,0.18)]">
          <img
            src="/images/spicest/hero_banner_brass.jpg"
            alt="Bowls of richly coloured spices ready for cooking"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover lg:aspect-[5/5]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#20120a]/35 to-transparent" />
        </div>

        <div className="max-w-xl">
          <span className="mb-5 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[#d85818]">
            <span className="h-px w-8 bg-current" /> About ISTA
          </span>
          <h2 id="about-title" className="font-display text-4xl font-semibold leading-[1.12] tracking-tight text-[#2b1b12] sm:text-5xl lg:text-6xl">
            A little spice.<br /><span className="italic text-[#d85818]">A lot of care.</span>
          </h2>
          <p className="mt-6 text-base leading-8 text-[#705a4c] sm:text-lg">
            Good food starts with ingredients you can trust. At ISTA, we bring the colour, aroma, and character of spices into everyday cooking. Whether you’re making a familiar family recipe or trying something new, we’re here to help every dish feel a little more special.
          </p>
          <Link to="/shop/all" className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#e85d19] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#c94d11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e85d19]">
            Explore our spices <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
