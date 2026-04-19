import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { ADMIN_DASHBOARD_PATH, ADMIN_LOGIN_PATH } from './lib/routes'

const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function RouteLoader() {
  return (
    <div className="auth-shell">
      <div className="glass card auth-card">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path={ADMIN_LOGIN_PATH} element={<Login />} />
        <Route path="/login" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route
          path={ADMIN_DASHBOARD_PATH}
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route path="/projects" element={<Navigate to={ADMIN_DASHBOARD_PATH} replace />} />
        <Route path="/" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
        <Route path="*" element={<Navigate to={ADMIN_LOGIN_PATH} replace />} />
      </Routes>
    </Suspense>
  )
}
