import { useState } from 'react'
import { MessageSquare, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

const blogPosts = [
  {
    id: 1,
    image: '/images/spicest/blog_1.png',
    date: 'August 12, 2022',
    title: 'Zdrowe chipsy & Artisanal Blends',
    excerpt: 'Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis...',
    comments: 12,
    likes: 24,
  },
  {
    id: 2,
    image: '/images/spicest/blog_2.png',
    date: 'August 12, 2022',
    title: 'Zdrowe chipsy with Fresh Herbs',
    excerpt: 'Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis...',
    comments: 8,
    likes: 31,
  },
  {
    id: 3,
    image: '/images/spicest/blog_3.png',
    date: 'August 12, 2022',
    title: 'Zdrowe chipsy & Chili Spices',
    excerpt: 'Nullam nulla eros, ultricies sit amet, nonummy id, imperdiet feugiat, pede. Sed lectus. Donec mollis...',
    comments: 19,
    likes: 45,
  },
]

export function SpicestBlogSection() {
  const [activeDot, setActiveDot] = useState(0)
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({})

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section className="py-16 bg-[#FAF8F5]" id="blog">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Our Blog
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Through our love for spices we have been producing and blending spices for you since 1998
          </p>
        </div>

        {/* 3 Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="group overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Blog Top Image */}
              <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-orange-50">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Blog Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-gray-400">
                    {post.date}
                  </span>
                  <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-[#E85D19] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer: Read More + Social Stats */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Button
                    size="sm"
                    className="rounded-full bg-[#E85D19] hover:bg-[#d24e0f] text-white text-xs px-4 py-1.5 font-semibold shadow-xs"
                  >
                    Read More
                  </Button>

                  <div className="flex items-center space-x-3 text-gray-400 text-xs">
                    <span className="flex items-center gap-1 hover:text-gray-600 transition-colors cursor-pointer">
                      <MessageSquare className="size-3.5" />
                      <span>{post.comments}</span>
                    </span>
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        likedPosts[post.id] ? 'text-rose-500' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`size-3.5 ${likedPosts[post.id] ? 'fill-current' : ''}`} />
                      <span>{post.likes + (likedPosts[post.id] ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots */}
        <div className="flex justify-center items-center space-x-2 mt-10">
          {blogPosts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveDot(idx)}
              className={`size-2.5 rounded-full transition-all duration-300 ${
                activeDot === idx ? 'bg-[#E85D19] w-6' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to blog slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
