import { Link } from 'react-router-dom'
import { Bell, LogOut, Store } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/auth/AuthProvider'

interface TopBarProps {
  title: string
  subtitle?: string
}

function initialsFromEmail(email: string | undefined): string {
  if (!email) return 'AD'
  return email.slice(0, 2).toUpperCase()
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 border-b border-[#EDE6DC] bg-white/90 px-4 backdrop-blur-md md:px-8 shadow-xs">
      {/* Title & Subtitle */}
      <div className="min-w-0">
        <h1 className="truncate font-display text-xl font-black text-slate-900 md:text-2xl tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs font-semibold text-slate-500 md:text-sm">{subtitle}</p>
        ) : null}
      </div>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Customer Shop CTA */}
        <Link to="/shop" className="hidden sm:inline-flex">
          <Button
            size="sm"
            className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg gap-1.5 text-xs font-bold transition-all hover:scale-105"
          >
            <Store className="size-3.5" />
            <span>Storefront</span>
          </Button>
        </Link>

        {/* Notifications Button */}
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative rounded-full bg-[#F7F3ED] hover:bg-orange-100 text-slate-700">
          <Bell className="size-4.5 text-slate-600" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
        </Button>

        {/* User Account Menu with Avatar & Name */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-full bg-[#F7F3ED] p-1 pr-3 border border-slate-200/80 hover:border-orange-300 transition-all cursor-pointer"
              aria-label="Account menu"
            >
              <Avatar className="size-8.5 ring-2 ring-orange-400/40">
                <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-rose-500 text-xs font-black text-white">
                  {initialsFromEmail(user?.email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">Admin User</span>
                <span className="text-[10px] font-semibold text-slate-500">Manager</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-200 bg-white">
            <DropdownMenuLabel className="max-w-48 truncate text-xs font-semibold text-slate-500">
              {user?.email || 'admin@istaspices.com'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="rounded-xl cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold"
            >
              <LogOut className="size-4 mr-2" aria-hidden="true" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
