import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant="outline"
          size="icon"
          className={cn(
            'size-9 border-transparent font-mono',
            p === page && 'border-foreground bg-foreground text-primary-foreground hover:bg-foreground/90',
          )}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
