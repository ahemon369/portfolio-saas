const LOGIN_ATTEMPTS_KEY = 'admin_login_attempts_v1'
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_COOLDOWN_MS = 15 * 60 * 1000

const actionTimestamps = new Map()

function safeReadAttempts() {
  try {
    const raw = window.localStorage.getItem(LOGIN_ATTEMPTS_KEY)
    const parsed = raw ? JSON.parse(raw) : null

    if (!parsed || typeof parsed !== 'object') {
      return { attempts: [], blockedUntil: 0 }
    }

    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      blockedUntil: Number(parsed.blockedUntil ?? 0),
    }
  } catch {
    return { attempts: [], blockedUntil: 0 }
  }
}

function safeWriteAttempts(state) {
  try {
    window.localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(state))
  } catch {
    // Ignore write failures in strict browser modes.
  }
}

export function getLoginProtectionState() {
  const now = Date.now()
  const current = safeReadAttempts()

  if (current.blockedUntil > now) {
    return {
      blocked: true,
      retryAfterMs: current.blockedUntil - now,
      attemptsLeft: 0,
    }
  }

  const freshAttempts = current.attempts.filter((stamp) => now - Number(stamp) <= LOGIN_WINDOW_MS)
  const attemptsLeft = Math.max(0, MAX_LOGIN_ATTEMPTS - freshAttempts.length)

  safeWriteAttempts({ attempts: freshAttempts, blockedUntil: 0 })

  return {
    blocked: attemptsLeft <= 0,
    retryAfterMs: attemptsLeft <= 0 ? LOGIN_COOLDOWN_MS : 0,
    attemptsLeft,
  }
}

export function registerLoginAttempt(success) {
  const now = Date.now()

  if (success) {
    safeWriteAttempts({ attempts: [], blockedUntil: 0 })
    return
  }

  const current = safeReadAttempts()
  const freshAttempts = current.attempts.filter((stamp) => now - Number(stamp) <= LOGIN_WINDOW_MS)
  freshAttempts.push(now)

  if (freshAttempts.length >= MAX_LOGIN_ATTEMPTS) {
    safeWriteAttempts({ attempts: [], blockedUntil: now + LOGIN_COOLDOWN_MS })
    return
  }

  safeWriteAttempts({ attempts: freshAttempts, blockedUntil: 0 })
}

export function shouldThrottleAction(actionKey, minIntervalMs = 800) {
  const now = Date.now()
  const last = Number(actionTimestamps.get(actionKey) ?? 0)

  if (now - last < minIntervalMs) {
    return true
  }

  actionTimestamps.set(actionKey, now)
  return false
}

export function formatRemainingTime(ms) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}s`
  }

  return `${minutes}m ${seconds}s`
}
