import { motion } from 'framer-motion'
import { LogOut, ShieldCheck } from 'lucide-react'

export function AdminLayout({ userEmail, onLogout, loggingOut, sessionWarning, children }) {
  return (
    <div className="shell">
      <div className="mesh" aria-hidden="true" />

      <main className="container">
        <motion.header
          className="glass header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div>
            <p className="eyebrow">Admin Panel</p>
            <h1>Portfolio Control Center</h1>
            <p className="subtitle">Signed in as {userEmail || 'admin user'}</p>
          </div>

          <button className="btn btn-outline" type="button" disabled={loggingOut} onClick={onLogout}>
            <LogOut size={15} />
            {loggingOut ? 'Signing out...' : 'Sign out'}
          </button>
        </motion.header>

        <section className="glass card notice">
          <ShieldCheck size={16} />
          <span>Supabase Auth + admin_users role verification active.</span>
        </section>

        {sessionWarning ? (
          <section className="glass card session-warning">
            <strong>Session expiring soon</strong>
            <span>Sign in again in about {sessionWarning.label} to avoid interruption.</span>
          </section>
        ) : null}

        {children}
      </main>
    </div>
  )
}
