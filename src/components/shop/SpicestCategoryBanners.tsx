import { ArrowRight } from 'lucide-react'

interface SpicestCategoryBannersProps {
  onCategoryClick?: (category: string) => void
}

export function SpicestCategoryBanners({ onCategoryClick }: SpicestCategoryBannersProps) {
  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Banner 1: BEST SPICE BLENDS */}
          <div 
            onClick={() => onCategoryClick?.('blends')}
            className="group relative overflow-hidden rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 flex items-center justify-between cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="space-y-3 z-10 max-w-[55%]">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-gray-900 leading-tight">
                BEST SPICE <br />BLENDS
              </h2>
              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E85D19] group-hover:translate-x-1 transition-transform">
                <span>Shop Now</span>
                <ArrowRight className="size-4" />
              </div>
            </div>

            <div className="w-[45%] h-32 sm:h-40 flex items-center justify-end">
              <img
                src="/images/spicest/banner_spice_blends.png"
                alt="Best Spice Blends"
                className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Banner 2: ROOTS AND RHIZOMES */}
          <div 
            onClick={() => onCategoryClick?.('spice-powder')}
            className="group relative overflow-hidden rounded-2xl bg-[#F7F5F0] p-6 sm:p-8 flex items-center justify-between cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
          >
            <div className="space-y-3 z-10 max-w-[55%]">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-gray-900 leading-tight">
                ROOTS AND <br />RHIZOMES
              </h2>
              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E85D19] group-hover:translate-x-1 transition-transform">
                <span>Shop Now</span>
                <ArrowRight className="size-4" />
              </div>
            </div>

            <div className="w-[45%] h-32 sm:h-40 flex items-center justify-end">
              <img
                src="/images/spicest/banner_roots_rhizomes.png"
                alt="Roots and Rhizomes"
                className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
