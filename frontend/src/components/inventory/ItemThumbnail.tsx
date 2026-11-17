import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemThumbnailProps {
  src: string | null
  alt: string
  className?: string
  aspectRatio?: 'square' | 'wide' | 'tall'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function ItemThumbnail({ src, alt, className, size = 'full' }: ItemThumbnailProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  const showPhoto = Boolean(src) && !failed

  const sizeClasses = {
    sm: 'size-12 rounded-xl',
    md: 'size-20 rounded-2xl',
    lg: 'size-28 sm:size-32 rounded-2xl',
    full: 'w-full h-40 sm:h-44 rounded-2xl',
  }

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-200/60 bg-slate-100/80 shadow-inner group-hover:border-orange-300 transition-colors',
        sizeClasses[size],
        className,
      )}
    >
      {showPhoto ? (
        <img
          src={src as string}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 text-slate-400 p-2 text-center">
          <ImageOff className="size-6 text-slate-400/80" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">No Image</span>
        </div>
      )}
    </div>
  )
}
