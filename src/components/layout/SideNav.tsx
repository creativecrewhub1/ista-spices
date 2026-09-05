import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Boxes, Package, ClipboardList, IndianRupee, Users, Store, Flame, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Products & Inventory', icon: Package },
  { to: '/stock', label: 'Stock', icon: Boxes },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/revenue', label: 'Revenue', icon: IndianRupee },
  { to: '/customers', label: 'Customers', icon: Users },
]

export function SideNav() {
  const navigate = useNavigate()

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#EDE6DC] bg-white text-slate-800 md:flex z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex h-20 items-center justify-between border-b border-[#F0E8DD] px-6">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <span className="flex size-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/30 group-hover:scale-110 transition-all duration-300">
            <Flame className="size-5 fill-white/20 group-hover:rotate-12 transition-transform duration-300" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-black tracking-wider text-slate-900">
              ISTA
            </span>
            <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase">
              Admin Studio
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <ul className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out active:scale-[0.98]',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 text-white shadow-lg shadow-orange-500/30 font-bold scale-[1.02]'
                    : 'text-slate-600 hover:bg-[#F7F3ED] hover:text-orange-600 hover:translate-x-1.5',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      'size-4.5 transition-all duration-300',
                      isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6',
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{label}</span>
                  {isActive && (
                    <span className="absolute right-3 size-2 rounded-full bg-white shadow-xs animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* REDISH Style Bottom Promotional Widget */}
      <div className="p-4 space-y-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 p-4 border border-orange-200/60 shadow-xs text-center group">
          <div className="h-16 w-full flex items-center justify-center mb-2">
            <img
              src="/images/spicest/hero_spices.png"
              alt="Spices"
              className="max-h-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-xs font-bold text-slate-800 leading-tight">
            Organize your spices & inventory
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 mb-3">
            Quickly manage your catalogue
          </p>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white py-2 px-3 text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-[1.02] active:scale-95"
          >
            <Plus className="size-3.5" />
            <span>Manage Spices</span>
          </button>
        </div>

        {/* Customer Storefront Link */}
        <NavLink
          to="/shop"
          className="flex items-center justify-center gap-2 w-full rounded-2xl border border-orange-200 bg-white py-2 px-4 text-xs font-bold text-orange-600 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xs"
        >
          <Store className="size-3.5" />
          <span>Customer Shop →</span>
        </NavLink>
      </div>
    </aside>
  )
}
