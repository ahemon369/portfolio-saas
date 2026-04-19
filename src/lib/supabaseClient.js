import { createClient } from '@supabase/supabase-js'

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

let supabaseClient = null

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

function createSupabaseInstance() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export function getSupabaseClient() {
  if (!hasSupabaseConfig()) {
    throw new Error('Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  if (!supabaseClient) {
    supabaseClient = createSupabaseInstance()
  }

  return supabaseClient
}
