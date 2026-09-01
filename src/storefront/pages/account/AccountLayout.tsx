import { NavLink, Outlet } from 'react-router-dom'
import { Heart, MapPin, Package, User } from 'lucide-react'
import { Breadcrumbs } from '../../components/Breadcrumbs'
import { mockCustomer } from '../../data/account'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Overview', to: '/account', icon: User, end: true },
  { label: 'Orders', to: '/account/orders', icon: Package },
  { label: 'Wishlist', to: '/account/wishlist', icon: Heart },
  { label: 'Profile & Addresses', to: '/account/profile', icon: MapPin },
]

export function AccountLayout() {
  return (
    <div className="band-cream mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Account' }]} />
      <div className="mt-4 flex flex-col gap-1">
        <h1 className="font-display text-3xl font-medium text-foreground">Hi, {mockCustomer.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted-foreground">Member since {new Date(mockCustomer.memberSince).getFullYear()}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Account" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )
              }
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
