import { getSupabaseClient } from './supabaseClient'

const analyticsTable = 'admin_analytics_events'

function normalizePath(pathname) {
  return String(pathname ?? '/').slice(0, 180)
}

export async function trackAdminEvent(eventName, metadata = {}) {
  const supabase = getSupabaseClient()

  const payload = {
    event_name: String(eventName ?? 'unknown').slice(0, 80),
    path: normalizePath(window.location.pathname),
    metadata,
    occurred_at: new Date().toISOString(),
  }

  const { error } = await supabase.from(analyticsTable).insert(payload)

  if (error) {
    const message = String(error.message ?? '').toLowerCase()
    if (message.includes('relation') || message.includes('does not exist')) {
      return
    }
    throw error
  }
}
