import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="relative min-h-svh bg-[#F7F3ED] font-sans text-slate-900 selection:bg-orange-500/20">
      {/* Soft Warm Radial Canvas Highlights */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute top-1/2 -left-32 size-96 rounded-full bg-rose-200/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 size-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative z-10">
        <SideNav />
        <div className="pb-16 md:pb-0 md:pl-64">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  )
}
