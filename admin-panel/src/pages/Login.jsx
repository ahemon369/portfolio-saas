import { useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '../context/adminAuth'
import { useToast } from '../context/ToastContext'
import { ADMIN_DASHBOARD_PATH } from '../lib/routes'

export default function Login() {
  const { user, isAdmin, login } = useAdminAuth()
  const { pushToast } = useToast()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const destination = useMemo(() => {
    const from = location.state?.from
    return typeof from === 'string' ? from : ADMIN_DASHBOARD_PATH
  }, [location.state])

  if (user && isAdmin) {
    return <Navigate to={destination} replace />
  }

  const onSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      await login({ email, password })
    } catch (submitError) {
      const message = submitError.message ?? 'Unable to sign in.'
      setError(message)
      pushToast('error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="mesh" aria-hidden="true" />

      <motion.form className="glass card auth-card" onSubmit={onSubmit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="auth-head">
          <span className="icon-badge">
            <ShieldCheck size={18} />
          </span>
          <h1>Admin Login</h1>
          <p>Sign in with your Supabase admin account.</p>
        </div>

        <label>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>

        <label>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn btn-primary full" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner spinner-inline" /> Signing in...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </motion.form>
    </div>
  )
}
