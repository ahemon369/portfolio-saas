const memoryStore = new Map()

function getNow() {
  return Date.now()
}

function normalizeEntries(entries, windowMs) {
  const now = getNow()
  return entries.filter((value) => Number.isFinite(value) && now - value <= windowMs)
}

function readStorage(key) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorage(key, entries) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(key, JSON.stringify(entries))
  } catch {
    // Ignore storage quota and private mode errors.
  }
}

function getEntries(key, windowMs) {
  const storageEntries = normalizeEntries(readStorage(key), windowMs)
  const memoryEntries = normalizeEntries(memoryStore.get(key) ?? [], windowMs)

  const merged = [...storageEntries, ...memoryEntries].sort((a, b) => a - b)
  memoryStore.set(key, merged)
  writeStorage(key, merged)

  return merged
}

export function getRateLimitState(key, options = {}) {
  const limit = Number(options.limit ?? 5)
  const windowMs = Number(options.windowMs ?? 60_000)
  const entries = getEntries(key, windowMs)
  const allowed = entries.length < limit
  const oldest = entries[0] ?? null

  return {
    allowed,
    remaining: Math.max(0, limit - entries.length),
    retryAfterMs: allowed || !oldest ? 0 : Math.max(0, windowMs - (getNow() - oldest)),
  }
}

export function recordRateLimitHit(key, options = {}) {
  const windowMs = Number(options.windowMs ?? 60_000)
  const entries = getEntries(key, windowMs)
  const updated = [...entries, getNow()]

  memoryStore.set(key, updated)
  writeStorage(key, updated)

  return updated.length
}

export function clearRateLimit(key) {
  memoryStore.delete(key)

  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(key)
  } catch {
    // Ignore storage errors.
  }
}
