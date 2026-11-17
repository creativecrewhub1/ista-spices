import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { LoadingState } from '@/components/common/QueryState'

/** Gates the admin panel — signed in AND role='admin'. A logged-in customer gets bounced to /shop, not /login. */
export function ProtectedRoute() {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState label="Loading…" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role !== 'admin') {
    return <Navigate to="/shop" replace />
  }

  return <Outlet />
}
