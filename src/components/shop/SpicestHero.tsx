import { Button } from '@/components/ui/button'

interface SpicestHeroProps {
  onBuyNowClick?: () => void
  onMoreProductClick?: () => void
}

export function SpicestHero({ onBuyNowClick, onMoreProductClick }: SpicestHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5] py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-block text-xs sm:text-sm font-semibold uppercase tracking-widest text-gray-500">
              Our Best Of World Class Spices!
            </span>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight text-gray-900 leading-[1.1]">
              EXQUISITE SPICES <br className="hidden sm:inline" />
              & SEASONING
            </h1>

            <p className="text-gray-600 text-sm sm:text-base max-w-lg font-sans leading-relaxed">
              Elevate every dish with our pure, freshly ground artisanal spices, authentic hand-crafted blends, and cold-pressed oils sourced directly from master growers.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                onClick={onBuyNowClick}
                className="rounded-full bg-[#E85D19] hover:bg-[#d24e0f] text-white px-8 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onMoreProductClick}
                className="rounded-full border-gray-300 bg-white hover:border-[#E85D19] hover:text-[#E85D19] text-gray-700 px-8 py-3 text-sm font-semibold shadow-sm transition-all"
              >
                More Product
              </Button>
            </div>
          </div>

          {/* Right Hero Image Visual */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg lg:max-w-xl">
              <div className="absolute -inset-4 rounded-full bg-orange-100/40 blur-3xl -z-10" />
              <img
                src="/images/spicest/hero_spices.png"
                alt="Exquisite Spices & Seasoning"
                className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
