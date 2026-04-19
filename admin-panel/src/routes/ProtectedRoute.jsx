import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../context/adminAuth'
import { ADMIN_LOGIN_PATH } from '../lib/routes'

export function ProtectedRoute({ children }) {
  const location = useLocation()
  const { loading, user, isAdmin, logout } = useAdminAuth()
  const forcedLogoutRef = useRef(false)

  useEffect(() => {
    if (!loading && user && !isAdmin && !forcedLogoutRef.current) {
      forcedLogoutRef.current = true
      logout().catch(() => {})
    }

    if (!user || isAdmin) {
      forcedLogoutRef.current = false
    }
  }, [loading, user, isAdmin, logout])

  if (loading || (user && !isAdmin)) {
    return (
      <div className="auth-shell">
        <div className="glass card auth-card">
          <div className="spinner" />
          <p>Checking session...</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace state={{ from: location.pathname }} />
  }

  return children
}
