import { Bell } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface TopBarProps {
  title: string
  subtitle?: string
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
      <div className="min-w-0">
        <h1 className="truncate font-heading text-lg font-semibold text-foreground md:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground md:text-sm">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />
        </Button>
        <Avatar className="size-9">
          <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
            AD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
