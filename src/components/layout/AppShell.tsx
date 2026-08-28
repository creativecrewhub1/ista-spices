import { Outlet } from 'react-router-dom'
import { SideNav } from './SideNav'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-svh bg-background">
      <SideNav />
      <div className="pb-16 md:pb-0 md:pl-64">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
