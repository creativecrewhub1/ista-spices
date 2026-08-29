import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { LoadingState } from '@/components/common/QueryState'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <LoadingState label="Loading…" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
