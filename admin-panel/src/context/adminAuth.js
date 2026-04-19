import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '../lib/supabaseClient'
import { useToast } from './ToastContext'
import { formatRemainingTime, getLoginProtectionState, registerLoginAttempt } from '../lib/security'

const AdminAuthContext = createContext(null)

const adminUsersTable = 'admin_users'
const allowedRoles = ['admin', 'owner', 'super_admin']
const loginAttemptsTable = 'security_login_attempts'
const sessionWarningMs = 5 * 60 * 1000

function isMissingColumnError(error) {
  return error?.code === '42703' || /column\s+/i.test(String(error?.message ?? ''))
}

function isLikelyNetworkError(error) {
  const message = String(error?.message ?? '').toLowerCase()
  return message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')
}

function isLikelyExpiredAuthError(error) {
  const message = String(error?.message ?? '').toLowerCase()
  return (
    message.includes('jwt') ||
    message.includes('expired') ||
    message.includes('refresh token') ||
    message.includes('session_not_found')
  )
}

function toAuthErrorMessage(error, fallback) {
  if (isLikelyExpiredAuthError(error)) {
    return 'Session expired. Please sign in again.'
  }

  if (isLikelyNetworkError(error)) {
    return 'Network error. Check your connection and retry.'
  }

  return String(error?.message ?? fallback)
}

async function lookupAdminRecord(supabase, userId, columnName) {
  const { data, error } = await supabase
    .from(adminUsersTable)
    .select('*')
    .eq(columnName, userId)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

async function resolveAdminMembership(supabase, userId) {
  if (!userId) {
    return { isAdmin: false, role: null }
  }

  let record = null

  try {
    record = await lookupAdminRecord(supabase, userId, 'user_id')
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw error
    }

    record = await lookupAdminRecord(supabase, userId, 'id')
  }

  if (!record) {
    return { isAdmin: false, role: null }
  }

  const role = String(record.role ?? '').trim().toLowerCase()
  const active = record.is_active !== false
  const hasRole = allowedRoles.length === 0 ? true : allowedRoles.includes(role)

  return {
    isAdmin: active && hasRole,
    role: role || null,
  }
}

async function reportLoginAttemptSupabase(supabase, payload) {
  const { error } = await supabase.from(loginAttemptsTable).insert(payload)

  if (!error) return

  const message = String(error.message ?? '').toLowerCase()
  if (message.includes('relation') || message.includes('does not exist')) {
    return
  }

  throw error
}

export function AdminAuthProvider({ children }) {
  const supabase = useMemo(() => getSupabaseClient(), [])
  const { pushToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sessionExpiresAt, setSessionExpiresAt] = useState(0)
  const [sessionWarning, setSessionWarning] = useState(null)

  const clearAuthState = useCallback(() => {
    setUser(null)
    setRole(null)
    setIsAdmin(false)
    setSessionExpiresAt(0)
    setSessionWarning(null)
  }, [])

  const forceUnauthorizedLogout = useCallback(async () => {
    await supabase.auth.signOut()
    clearAuthState()
    pushToast('error', 'Unauthorized')
  }, [supabase, clearAuthState, pushToast])

  const syncSession = useCallback(
    async (session) => {
      if (!session?.user?.id) {
        clearAuthState()
        return
      }

      const expiresAt = Number(session.expires_at ?? 0) * 1000
      setSessionExpiresAt(expiresAt > 0 ? expiresAt : 0)

      const membership = await resolveAdminMembership(supabase, session.user.id)

      if (!membership.isAdmin) {
        await forceUnauthorizedLogout()
        return
      }

      setUser(session.user)
      setRole(membership.role)
      setIsAdmin(true)
    },
    [supabase, clearAuthState, forceUnauthorizedLogout],
  )

  useEffect(() => {
    if (!sessionExpiresAt) {
      setSessionWarning(null)
      return
    }

    const interval = window.setInterval(() => {
      const remainingMs = sessionExpiresAt - Date.now()

      if (remainingMs <= 0) {
        setSessionWarning(null)
        clearAuthState()
        supabase.auth.signOut().catch(() => {})
        pushToast('info', 'Session expired. Please sign in again.')
        return
      }

      if (remainingMs <= sessionWarningMs) {
        setSessionWarning({
          remainingMs,
          label: formatRemainingTime(remainingMs),
        })
        return
      }

      setSessionWarning(null)
    }, 15000)

    return () => {
      window.clearInterval(interval)
    }
  }, [sessionExpiresAt, clearAuthState, pushToast, supabase])

  useEffect(() => {
    let isMounted = true

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          throw error
        }

        if (!isMounted) return
        await syncSession(data?.session ?? null)
      } catch (error) {
        if (!isMounted) return
        clearAuthState()
        pushToast('error', toAuthErrorMessage(error, 'Unable to restore session.'))
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      ;(async () => {
        try {
          await syncSession(session)
        } catch (error) {
          if (!isMounted) return
          clearAuthState()
          pushToast('error', toAuthErrorMessage(error, 'Authentication error. Please sign in again.'))
        } finally {
          if (isMounted) {
            setLoading(false)
          }
        }
      })()
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [supabase, syncSession, clearAuthState, pushToast])

  const login = useCallback(
    async ({ email, password }) => {
      const normalizedEmail = String(email ?? '').trim()
      const normalizedPassword = String(password ?? '').trim()

      if (!normalizedEmail || !normalizedPassword) {
        throw new Error('Email and password are required.')
      }

      const protectionState = getLoginProtectionState()
      if (protectionState.blocked) {
        throw new Error(`Too many login attempts. Try again in ${formatRemainingTime(protectionState.retryAfterMs)}.`)
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      })

      if (error) {
        registerLoginAttempt(false)
        await reportLoginAttemptSupabase(supabase, {
          email: normalizedEmail.toLowerCase(),
          success: false,
          reason: 'invalid_credentials',
          attempted_at: new Date().toISOString(),
        }).catch(() => {})
        throw new Error(toAuthErrorMessage(error, 'Unable to sign in.'))
      }

      const signedUser = data.user
      const membership = await resolveAdminMembership(supabase, signedUser?.id)

      if (!membership.isAdmin) {
        registerLoginAttempt(false)
        await reportLoginAttemptSupabase(supabase, {
          email: normalizedEmail.toLowerCase(),
          success: false,
          reason: 'not_admin',
          attempted_at: new Date().toISOString(),
        }).catch(() => {})
        await forceUnauthorizedLogout()
        throw new Error('Unauthorized')
      }

      registerLoginAttempt(true)
      await reportLoginAttemptSupabase(supabase, {
        email: normalizedEmail.toLowerCase(),
        success: true,
        reason: 'ok',
        attempted_at: new Date().toISOString(),
      }).catch(() => {})

      setUser(signedUser)
      setRole(membership.role)
      setIsAdmin(true)
      setSessionExpiresAt(Number(data.session?.expires_at ?? 0) * 1000 || 0)

      return signedUser
    },
    [supabase, forceUnauthorizedLogout],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    clearAuthState()
  }, [supabase, clearAuthState])

  const value = useMemo(
    () => ({
      loading,
      user,
      role,
      isAdmin,
      sessionWarning,
      login,
      logout,
    }),
    [loading, user, role, isAdmin, sessionWarning, login, logout],
  )

  return createElement(AdminAuthContext.Provider, { value }, children)
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider.')
  }

  return context
}
