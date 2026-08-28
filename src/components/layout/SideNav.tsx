import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ClipboardList, IndianRupee, Users, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Products & Inventory', icon: Package },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/revenue', label: 'Revenue', icon: IndianRupee },
  { to: '/customers', label: 'Customers', icon: Users },
]

export function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="size-4.5" aria-hidden="true" />
        </span>
        <span className="font-heading text-lg font-semibold">Ista Spices</span>
      </div>
      <ul className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4.5" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        Admin panel &middot; Homemade spices &amp; oils
      </div>
    </aside>
  )
}
