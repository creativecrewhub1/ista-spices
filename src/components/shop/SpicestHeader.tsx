import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, ChevronDown, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountMenu } from './AccountMenu'
import { useCart } from '@/shop/CartContext'
import { useAuth } from '@/auth/AuthProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function SpicestHeader() {
  const { count } = useCart()
  const { session, role } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Browsing/filtering always happens on the full shop page — clicking a
  // category or searching from anywhere else (e.g. the homepage) jumps there.
  function goToShop(params: Record<string, string>) {
    const query = new URLSearchParams(params).toString()
    navigate(`/shop/all${query ? `?${query}` : ''}`)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) goToShop({ q: searchQuery.trim() })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-orange-100/60 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/shop" className="flex items-center gap-2 group">
          <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider text-[#E85D19] group-hover:opacity-90 transition-opacity">
            SPICEST
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-700">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-[#E85D19] transition-colors focus:outline-none cursor-pointer">
              Categories
              <ChevronDown className="size-4 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-2 rounded-xl shadow-lg border-orange-100 bg-white">
              <DropdownMenuItem
                onClick={() => goToShop({})}
                className="rounded-lg cursor-pointer hover:bg-orange-50 hover:text-[#E85D19]"
              >
                All Products
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => goToShop({ category: 'spice-powder' })}
                className="rounded-lg cursor-pointer hover:bg-orange-50 hover:text-[#E85D19]"
              >
                Spice Powders
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => goToShop({ category: 'cooking-oil' })}
                className="rounded-lg cursor-pointer hover:bg-orange-50 hover:text-[#E85D19]"
              >
                Cold-Pressed Oils
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/shop/all" className="hover:text-[#E85D19] transition-colors">
            Shop
          </Link>

          <a href="#about" className="hover:text-[#E85D19] transition-colors">
            About Us
          </a>
          <a href="#blog" className="hover:text-[#E85D19] transition-colors">
            Blog
          </a>
          <a href="#footer" className="hover:text-[#E85D19] transition-colors">
            Contact Us
          </a>
        </nav>

        {/* Right Section Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Search Toggle / Input */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search spices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-36 sm:w-48 rounded-full border border-orange-200 bg-orange-50/50 py-1.5 pl-3 pr-8 text-xs sm:text-sm focus:border-[#E85D19] focus:outline-none focus:ring-1 focus:ring-[#E85D19]"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-[#E85D19] transition-colors py-1.5 px-2.5 rounded-full hover:bg-orange-50/60"
              >
                <Search className="size-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            )}
          </div>

          {/* Cart Button */}
          <Link to="/shop/cart" className="relative p-2 text-gray-700 hover:text-[#E85D19] transition-colors">
            <ShoppingBag className="size-5 sm:size-6" />
            {count > 0 && (
              <span className="absolute top-0 right-0 flex size-4 sm:size-5 items-center justify-center rounded-full bg-[#E85D19] text-[10px] sm:text-xs font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </Link>

          {/* Authentication & Dashboard Buttons */}
          {session ? (
            <div className="flex items-center gap-2">
              {role === 'admin' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="hidden lg:flex gap-1.5 rounded-full border-orange-200 text-xs font-medium text-gray-700 hover:border-[#E85D19] hover:bg-orange-50"
                >
                  <LayoutDashboard className="size-3.5" />
                  Admin
                </Button>
              ) : null}
              <AccountMenu />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-gray-300 px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:border-[#E85D19] hover:text-[#E85D19] transition-all"
                >
                  Login
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="sm"
                  className="rounded-full bg-[#E85D19] hover:bg-[#d24e0f] text-white px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-medium shadow-sm transition-all"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
