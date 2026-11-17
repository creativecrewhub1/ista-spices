import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRightCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SpicestHeroProps {
  onBuyNowClick?: () => void
  onMoreProductClick?: () => void
}

const HERO_SLIDES = [
  {
    id: 1,
    type: 'desi_masale',
    line1: 'COOK',
    line1Accent: 'WITH',
    line2: 'DELIGHT',
    line3: 'WITH OUR PRODUCTS',
    subtitle: 'Elevate every dish with our pure, freshly ground artisanal spices, authentic hand-crafted blends, and cold-pressed oils.',
    buttonText: 'Shop Spices',
    image: '/images/spicest/hero_desi_masale_bg.jpg',
  },
  {
    id: 2,
    type: 'classic',
    title: 'Everything you lacked for cooking',
    subtitle: 'Hand-crafted artisanal spices, fresh cold-pressed oils & authentic Indian blends sourced directly from master growers.',
    buttonText: 'Shop Now!',
    image: '/images/spicest/hero_banner_dark.jpg',
  },
  {
    id: 3,
    type: 'classic',
    title: 'Exquisite Spices & Seasoning',
    subtitle: 'Elevate every dish with our pure, freshly ground artisanal masalas and traditional secret recipes.',
    buttonText: 'Explore Catalogue',
    image: '/images/spicest/hero_desi_masale_bg.jpg',
  },
  {
    id: 4,
    type: 'classic',
    title: 'Pure Flavors, Authentic Tradition',
    subtitle: 'Crafted with love from seed to spoon — 100% natural purity, rich heritage aromas & zero artificial preservatives.',
    buttonText: 'Discover ISTA Spices',
    image: '/images/spicest/hero_banner_brass.jpg',
  },
]

export function SpicestHero({ onBuyNowClick, onMoreProductClick }: SpicestHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-play timer for hero banner slider (6 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const slide = HERO_SLIDES[currentSlide]

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 min-h-[440px] sm:min-h-[520px] lg:min-h-[580px] flex items-center">
      
      {/* Background Image Carousel Layer */}
      {HERO_SLIDES.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Main Background Image */}
          <img
            src={s.image}
            alt="Artisanal Spices Banner"
            className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-linear"
          />
          {/* Dark Overlay Gradient to match Reference UI */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/35" />
        </div>
      ))}

      {/* Hero Content Container */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 sm:px-12 lg:px-16 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-left-4 duration-700">
          
          {/* Slide 1: Desi Masale Typography (COOK WITH DELIGHT WITH OUR PRODUCTS) */}
          {slide.type === 'desi_masale' ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="font-sans text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight uppercase leading-none drop-shadow-lg">
                  {slide.line1}
                </span>
                <span className="font-serif italic text-3xl sm:text-5xl font-normal text-rose-500 tracking-wider drop-shadow-md">
                  {slide.line1Accent}
                </span>
              </div>
              <div className="font-serif italic text-5xl sm:text-7xl lg:text-8xl text-white font-light tracking-wide leading-none drop-shadow-xl text-shadow-lg">
                {slide.line2}
              </div>
              <div className="font-mono text-xs sm:text-sm lg:text-base font-extrabold uppercase tracking-[0.35em] text-slate-300 pt-2 drop-shadow-sm">
                {slide.line3}
              </div>
            </div>
          ) : (
            /* Slide 2 & 3: Classic Serif Title */
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-wide drop-shadow-md">
              {slide.title}
            </h1>
          )}

          {/* Subtitle Description */}
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg font-sans max-w-xl leading-relaxed drop-shadow-sm">
            {slide.subtitle}
          </p>

          {/* CTA Action Button (Matching Reference UI "Shop Now! ->") */}
          <div className="pt-3">
            <Button
              size="lg"
              onClick={onBuyNowClick || onMoreProductClick}
              className="group inline-flex items-center gap-3 rounded-md border-2 border-white/90 bg-black/40 hover:bg-white hover:text-black text-white px-7 py-3.5 text-sm sm:text-base font-bold tracking-wider transition-all duration-300 shadow-xl backdrop-blur-sm active:scale-95 cursor-pointer"
            >
              <span>{slide.buttonText}</span>
              <ArrowRightCircle className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>

        </div>
      </div>

      {/* Left Carousel Arrow Controls (Matching Reference UI "<") */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-6 top-1/2 z-30 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-300 shadow-lg active:scale-90 border border-white/20 cursor-pointer"
      >
        <ChevronLeft className="size-6 sm:size-7" />
      </button>

      {/* Right Carousel Arrow Controls (Matching Reference UI ">") */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 sm:right-6 top-1/2 z-30 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-300 shadow-lg active:scale-90 border border-white/20 cursor-pointer"
      >
        <ChevronRight className="size-6 sm:size-7" />
      </button>

      {/* Bottom Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
              index === currentSlide ? 'w-8 bg-rose-500 shadow-md shadow-rose-500/50' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

    </section>
  )
}
