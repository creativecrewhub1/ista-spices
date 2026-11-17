import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function SpicestCategoryBanners() {
  const navigate = useNavigate()

  function goToCategory(category: string) {
    navigate(`/shop/all?category=${category}`)
  }

  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Banner 1: BEST SPICE BLENDS */}
          <div 
            onClick={() => goToCategory('spice-powder')}
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

          <button
            type="button"
            onClick={() => goToCategory('cooking-oil')}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-gray-100 bg-[#F7F5F0] p-6 text-left cursor-pointer transition-all duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E85D19] sm:p-8"
          >
            <div className="space-y-3 z-10 max-w-[55%]">
              <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-gray-900 leading-tight">
                COLD-PRESSED <br />OILS
              </h2>
              <div className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#E85D19] group-hover:translate-x-1 transition-transform">
                <span>Shop Now</span>
                <ArrowRight className="size-4" />
              </div>
            </div>

            <div className="w-[45%] h-32 sm:h-40 flex items-center justify-end">
              <img
                src="/images/products/peanut_oil.jpg"
                alt="Peanut oil in a glass bottle"
                loading="lazy"
                className="h-full w-full rounded-xl object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </button>

        </div>
      </div>
    </section>
  )
}
