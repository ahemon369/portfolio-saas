import axios from 'axios'
import { toServiceError } from '../lib/errors'
import { getSupabaseClient } from '../lib/supabaseClient'
import { normalizeProjectRecord } from '../lib/projectUtils'

const baseURL = ''
const projectsTable = 'projects'
const projectsBucket = 'projects'

const CACHE_TTL_MS = 60_000

const projectsCache = {
  data: null,
  expiresAt: 0,
  inFlight: null,
}

export const API_ENDPOINTS = {
  contact: '/contact',
}

function toApiError(error) {
  return toServiceError(error, 'Something went wrong while communicating with the API.', 500)
}

function normalizeSupabaseError(error, fallbackMessage) {
  return toServiceError(error, fallbackMessage, 500)
}

function normalizeProjectList(items, supabase) {
  return (items ?? []).map((project) => normalizeProjectRecord(project, supabase, projectsBucket))
}

function setProjectsCache(items) {
  projectsCache.data = items
  projectsCache.expiresAt = Date.now() + CACHE_TTL_MS
}

export function invalidateProjectsCache() {
  projectsCache.data = null
  projectsCache.expiresAt = 0
  projectsCache.inFlight = null
}

export const api = axios.create({
  baseURL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
)

async function fetchProjectsFromSupabase() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from(projectsTable)
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false, nullsFirst: false })

  if (error) {
    throw normalizeSupabaseError(error, 'Unable to load projects right now. Please try again shortly.')
  }

  return normalizeProjectList(data, supabase)
}

export async function fetchProjects() {
  return getProjects()
}

export async function getProjects(options = {}) {
  const force = Boolean(options.force)
  const hasFreshCache = projectsCache.data && projectsCache.expiresAt > Date.now()

  if (!force && hasFreshCache) {
    return projectsCache.data
  }

  if (!force && projectsCache.inFlight) {
    return projectsCache.inFlight
  }

  const requestPromise = fetchProjectsFromSupabase()
    .then((items) => {
      setProjectsCache(items)
      return items
    })
    .finally(() => {
      projectsCache.inFlight = null
    })

  projectsCache.inFlight = requestPromise

  return requestPromise
}

export async function sendContact(payload) {
  try {
    const response = await api.post(API_ENDPOINTS.contact, payload)
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}
