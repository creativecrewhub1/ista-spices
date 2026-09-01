import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ItemThumbnailProps {
  src: string | null
  alt: string
  className?: string
}

/**
 * Square photo for an inventory row. Falls back to a placeholder both when the
 * record has no image_url yet and when the file behind one fails to load, so a
 * broken path never leaves a torn image icon in the grid.
 */
export function ItemThumbnail({ src, alt, className }: ItemThumbnailProps) {
  const [failed, setFailed] = useState(false)

  // A different record can reuse this slot as the list re-renders; without the
  // reset a single bad URL would poison the placeholder for whatever follows.
  useEffect(() => setFailed(false), [src])

  const showPhoto = Boolean(src) && !failed

  return (
    <div
      className={cn(
        'flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted',
        className,
      )}
    >
      {showPhoto ? (
        <img src={src as string} alt={alt} loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <ImageOff className="size-4 text-muted-foreground/60" aria-hidden="true" />
      )}
    </div>
  )
}
