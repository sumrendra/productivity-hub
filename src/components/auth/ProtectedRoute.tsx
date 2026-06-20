import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/auth-client'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}
