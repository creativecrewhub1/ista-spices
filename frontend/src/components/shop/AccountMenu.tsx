import { Link } from 'react-router-dom'
import { LogOut, Package, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/auth/AuthProvider'

function initials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email
  return source ? source.slice(0, 2).toUpperCase() : 'U'
}

/** Shared account dropdown for the storefront, once signed in — used by both SpicestHeader and ShopHeader. */
export function AccountMenu() {
  const { user, signOut } = useAuth()
  const fullName = user?.user_metadata?.full_name as string | undefined
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName = fullName ?? user?.email ?? 'Account'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80"
          aria-label="Account menu"
        >
          <Avatar className="size-9">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials(fullName, user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="max-w-48 truncate font-normal text-muted-foreground">
          {displayName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/shop/profile">
            <UserIcon className="size-4" aria-hidden="true" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/shop/orders">
            <Package className="size-4" aria-hidden="true" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOut()}>
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
