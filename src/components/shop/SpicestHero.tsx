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
    title: 'Everything you lacked for cooking',
    subtitle: 'Hand-crafted artisanal spices, fresh cold-pressed oils & authentic Indian blends sourced directly from master growers.',
    buttonText: 'Shop Now!',
    image: '/images/spicest/hero_banner_dark.jpg',
  },
  {
    id: 2,
    title: 'Exquisite Spices & Seasoning',
    subtitle: 'Elevate every dish with our pure, freshly ground artisanal masalas and traditional secret recipes.',
    buttonText: 'Explore Catalogue',
    image: '/images/spicest/hero_banner_dark.jpg',
  },
  {
    id: 3,
    title: 'Pure Farm-Fresh Quality',
    subtitle: '100% natural, chemical-free ingredients packaged under strict hygienic quality controls.',
    buttonText: 'Buy Now',
    image: '/images/spicest/hero_banner_dark.jpg',
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
    <section className="relative w-full overflow-hidden bg-slate-950 min-h-[420px] sm:min-h-[500px] lg:min-h-[560px] flex items-center">
      
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
            alt={s.title}
            className="h-full w-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-linear"
          />
          {/* Dark Overlay Gradient to match Reference UI */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
        </div>
      ))}

      {/* Hero Content Container */}
      <div className="relative z-20 mx-auto max-w-7xl px-6 sm:px-12 lg:px-16 py-16 sm:py-24 w-full">
        <div className="max-w-2xl space-y-6 motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-left-4 duration-700">
          
          {/* Slide Title (Matching reference Serif typography) */}
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-light text-white leading-tight tracking-wide drop-shadow-md">
            {slide.title}
          </h1>

          {/* Slide Subtitle */}
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg font-sans max-w-xl leading-relaxed drop-shadow-sm">
            {slide.subtitle}
          </p>

          {/* CTA Action Button (Matching Reference UI "Shop Now! ->") */}
          <div className="pt-4">
            <Button
              size="lg"
              onClick={onBuyNowClick || onMoreProductClick}
              className="group inline-flex items-center gap-3 rounded-md border-2 border-white/90 bg-black/40 hover:bg-white hover:text-black text-white px-7 py-3.5 text-sm sm:text-base font-bold tracking-wider transition-all duration-300 shadow-xl backdrop-blur-sm active:scale-95"
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
        className="absolute left-3 sm:left-6 top-1/2 z-30 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-300 shadow-lg active:scale-90 border border-white/20"
      >
        <ChevronLeft className="size-6 sm:size-7" />
      </button>

      {/* Right Carousel Arrow Controls (Matching Reference UI ">") */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-3 sm:right-6 top-1/2 z-30 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-lg bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all duration-300 shadow-lg active:scale-90 border border-white/20"
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
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index === currentSlide ? 'w-8 bg-orange-500 shadow-md shadow-orange-500/50' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

    </section>
  )
}
