import { useState } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Cooper, Kristin',
    company: 'Amazon',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    quote: 'The services provided are really great, we received a genuine advice and at very reasonable cost.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Black, Marvin',
    company: 'Amazon',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    quote: 'Amazing service! Claire helped me to reduce the shipping price a little and shipped it immediately.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Miles, Esther',
    company: 'Amazon',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    quote: 'Just came back to home and should say that it is definitely a great experience. I would recommend it.',
    rating: 5,
  },
]

export function SpicestTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-16 bg-white" id="testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-12 sm:mb-16">
          <span className="text-xs uppercase font-semibold tracking-widest text-gray-400">
            Testimonials
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Our Clients Say About Us
          </h2>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => setActiveIndex(idx)}
              className={`flex flex-col justify-between rounded-2xl p-6 sm:p-8 bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                activeIndex === idx ? 'ring-2 ring-[#E85D19]/30 shadow-md' : ''
              }`}
            >
              {/* Top Avatar */}
              <div className="flex flex-col items-center text-center space-y-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="size-16 rounded-full object-cover shadow-sm border-2 border-orange-100"
                />
                
                {/* Quote Text */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author Info & Rating */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="text-left">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">{t.name}</h4>
                  <p className="text-[11px] text-gray-400">{t.company}</p>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                  <span className="ml-1 text-[11px] font-bold text-gray-600">5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`size-2.5 rounded-full transition-all duration-300 ${
                activeIndex === idx
                  ? 'bg-[#E85D19] w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
