import { getSupabaseClient } from '../lib/supabaseClient'
import { shouldThrottleAction } from '../lib/security'

const projectsTable = 'projects'
const projectsBucket = 'projects'
const adminUsersTable = 'admin_users'
const allowedRoles = ['admin', 'owner', 'super_admin']
const cacheTtlMs = 60_000

const projectsCache = {
  data: null,
  expiresAt: 0,
  inFlight: null,
}

const schemaCapabilities = {
  checked: false,
  hasStatus: true,
  hasSortOrder: true,
}

function parseMissingColumn(error) {
  return error?.code === '42703' || /column\s+/i.test(String(error?.message ?? ''))
}

function parseColumnName(error) {
  const message = String(error?.message ?? '')
  const match = message.match(/column\s+"?([a-zA-Z0-9_]+)"?\s+does\s+not\s+exist/i)
  return match?.[1]?.toLowerCase() ?? ''
}

function normalizeStatus(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  return normalized === 'draft' ? 'draft' : 'published'
}

async function ensureSchemaCapabilities(supabase) {
  if (schemaCapabilities.checked) {
    return schemaCapabilities
  }

  const { error } = await supabase.from(projectsTable).select('id,status,sort_order').limit(1)

  if (error && parseMissingColumn(error)) {
    const columnName = parseColumnName(error)
    if (columnName === 'status') {
      schemaCapabilities.hasStatus = false
      schemaCapabilities.checked = false
      const retry = await supabase.from(projectsTable).select('id,sort_order').limit(1)
      if (retry.error && parseMissingColumn(retry.error)) {
        schemaCapabilities.hasSortOrder = false
      }
      schemaCapabilities.checked = true
      return schemaCapabilities
    }

    if (columnName === 'sort_order') {
      schemaCapabilities.hasSortOrder = false
      schemaCapabilities.checked = false
      const retry = await supabase.from(projectsTable).select('id,status').limit(1)
      if (retry.error && parseMissingColumn(retry.error)) {
        schemaCapabilities.hasStatus = false
      }
      schemaCapabilities.checked = true
      return schemaCapabilities
    }

    schemaCapabilities.hasStatus = false
    schemaCapabilities.hasSortOrder = false
    schemaCapabilities.checked = true
    return schemaCapabilities
  }

  schemaCapabilities.checked = true
  return schemaCapabilities
}

function toApiError(error, fallback) {
  const message = String(error?.message ?? '').toLowerCase()

  if (message.includes('too many requests')) {
    return new Error('Too many requests. Please slow down and retry.')
  }

  if (message.includes('jwt') || message.includes('expired') || message.includes('refresh token')) {
    return new Error('Session expired. Please sign in again.')
  }

  if (message.includes('unauthorized') || message.includes('not authorized') || error?.code === '42501') {
    return new Error('Unauthorized')
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
    return new Error('Network error. Check your connection and retry.')
  }

  return new Error(String(error?.message ?? fallback))
}

async function requireActiveSession(supabase) {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw toApiError(error, 'Session validation failed.')
  }

  const session = data?.session
  if (!session?.user?.id) {
    throw new Error('Session expired. Please sign in again.')
  }

  if (session.expires_at && session.expires_at * 1000 <= Date.now()) {
    await supabase.auth.signOut().catch(() => {})
    throw new Error('Session expired. Please sign in again.')
  }

  return session
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

async function requireAuthorizedAdmin(supabase) {
  const session = await requireActiveSession(supabase)

  let record = null
  try {
    record = await lookupAdminRecord(supabase, session.user.id, 'user_id')
  } catch (error) {
    if (!parseMissingColumn(error)) {
      throw toApiError(error, 'Unable to verify admin access.')
    }

    record = await lookupAdminRecord(supabase, session.user.id, 'id')
  }

  if (!record) {
    await supabase.auth.signOut().catch(() => {})
    throw new Error('Unauthorized')
  }

  const role = String(record.role ?? '').trim().toLowerCase()
  const active = record.is_active !== false
  const allowed = allowedRoles.includes(role)

  if (!active || !allowed) {
    await supabase.auth.signOut().catch(() => {})
    throw new Error('Unauthorized')
  }

  return session
}

function sanitizeText(value, maxLength = 4000) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function normalizeTechStack(value) {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeText(item, 64)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => sanitizeText(item, 64))
      .filter(Boolean)
  }

  return []
}

function sanitizeUrlOrNull(value, fieldName) {
  const normalized = sanitizeText(value, 600)
  if (!normalized) return null

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    throw new Error(`${fieldName} must be a valid URL.`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${fieldName} must start with http:// or https://.`)
  }

  return parsed.toString()
}

function toSafeFileSlug(value) {
  return sanitizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

function resolveImageUrl(rawImage, supabase) {
  if (!rawImage) {
    return ''
  }

  if (/^https?:\/\//i.test(rawImage)) {
    return rawImage
  }

  const { data } = supabase.storage.from(projectsBucket).getPublicUrl(rawImage)
  return data?.publicUrl ?? ''
}

function normalizeProject(project, supabase) {
  const techStack = normalizeTechStack(project.tech ?? project.tech_stack ?? project.techStack)

  return {
    ...project,
    title: sanitizeText(project.title, 180),
    description: sanitizeText(project.description, 4000),
    techStack,
    githubUrl: sanitizeText(project.github ?? project.github_url ?? '', 600),
    liveUrl: sanitizeText(project.live ?? project.live_url ?? '', 600),
    imagePath: sanitizeText(project.image ?? project.image_path ?? '', 600),
    imageUrl: resolveImageUrl(project.image ?? project.image_path ?? '', supabase),
    status: normalizeStatus(project.status),
    sortOrder: Number(project.sort_order ?? project.sortOrder ?? 0),
  }
}

function toPayload(values, capabilities) {
  const title = sanitizeText(values.title, 180)
  const description = sanitizeText(values.description, 4000)

  if (!title) {
    throw new Error('Title is required.')
  }

  if (!description) {
    throw new Error('Description is required.')
  }

  const payload = {
    title,
    description,
    tech: normalizeTechStack(values.techStack),
    github: sanitizeUrlOrNull(values.githubUrl, 'GitHub URL'),
    live: sanitizeUrlOrNull(values.liveUrl, 'Live URL'),
    image: sanitizeText(values.imagePath ?? values.image, 600) || null,
  }

  if (capabilities.hasStatus) {
    payload.status = normalizeStatus(values.status)
  }

  if (capabilities.hasSortOrder && Number.isFinite(Number(values.sortOrder))) {
    payload.sort_order = Number(values.sortOrder)
  }

  return payload
}

function setProjectsCache(data) {
  projectsCache.data = data
  projectsCache.expiresAt = Date.now() + cacheTtlMs
}

export function invalidateProjectsCache() {
  projectsCache.data = null
  projectsCache.expiresAt = 0
  projectsCache.inFlight = null
}

export async function listProjects(options = {}) {
  const force = Boolean(options.force)
  const hasFreshCache = projectsCache.data && projectsCache.expiresAt > Date.now()

  if (!force && hasFreshCache) {
    return projectsCache.data
  }

  if (!force && projectsCache.inFlight) {
    return projectsCache.inFlight
  }

  const supabase = getSupabaseClient()
  await requireAuthorizedAdmin(supabase)
  await ensureSchemaCapabilities(supabase)

  const request = supabase
    .from(projectsTable)
    .select('*')
    .order('created_at', { ascending: false, nullsFirst: false })
    .then(({ data, error }) => {
      if (error) {
        throw toApiError(error, 'Unable to load projects.')
      }

      const normalized = (data ?? [])
        .map((item) => normalizeProject(item, supabase))
        .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
      setProjectsCache(normalized)
      return normalized
    })
    .finally(() => {
      projectsCache.inFlight = null
    })

  projectsCache.inFlight = request
  return request
}

export async function createProject(values) {
  const supabase = getSupabaseClient()
  if (shouldThrottleAction('createProject')) {
    throw new Error('Too many requests. Please slow down and retry.')
  }

  await requireAuthorizedAdmin(supabase)
  const capabilities = await ensureSchemaCapabilities(supabase)
  const payload = toPayload(values, capabilities)

  const { data, error } = await supabase.from(projectsTable).insert(payload).select('*').single()

  if (error) {
    throw toApiError(error, 'Unable to create project.')
  }

  invalidateProjectsCache()
  return normalizeProject(data, supabase)
}

export async function updateProject(id, values) {
  if (!id) {
    throw new Error('Project id is required.')
  }

  const supabase = getSupabaseClient()
  if (shouldThrottleAction(`updateProject:${id}`)) {
    throw new Error('Too many requests. Please slow down and retry.')
  }

  await requireAuthorizedAdmin(supabase)
  const capabilities = await ensureSchemaCapabilities(supabase)
  const payload = toPayload(values, capabilities)

  const { data, error } = await supabase
    .from(projectsTable)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw toApiError(error, 'Unable to update project.')
  }

  invalidateProjectsCache()
  return normalizeProject(data, supabase)
}

export async function deleteProject(id) {
  if (!id) {
    throw new Error('Project id is required.')
  }

  const supabase = getSupabaseClient()
  if (shouldThrottleAction(`deleteProject:${id}`)) {
    throw new Error('Too many requests. Please slow down and retry.')
  }

  await requireAuthorizedAdmin(supabase)
  const { error } = await supabase.from(projectsTable).delete().eq('id', id)

  if (error) {
    throw toApiError(error, 'Unable to delete project.')
  }

  invalidateProjectsCache()
}

export async function uploadProjectImage(file, title) {
  if (!file) {
    throw new Error('Please select an image file.')
  }

  const sanitizedTitle = sanitizeText(title, 120)
  if (!sanitizedTitle) {
    throw new Error('Title is required before image upload.')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be 5MB or smaller.')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.')
  }

  const supabase = getSupabaseClient()
  if (shouldThrottleAction('uploadProjectImage')) {
    throw new Error('Too many requests. Please slow down and retry.')
  }

  await requireAuthorizedAdmin(supabase)
  const filePath = `projects/${Date.now()}-${toSafeFileSlug(sanitizedTitle)}.png`

  const { error } = await supabase.storage.from(projectsBucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw toApiError(error, 'Unable to upload image.')
  }

  const { data } = supabase.storage.from(projectsBucket).getPublicUrl(filePath)

  return {
    path: filePath,
    publicUrl: data?.publicUrl ?? '',
  }
}

export async function reorderProjects(projects) {
  const supabase = getSupabaseClient()
  await requireAuthorizedAdmin(supabase)
  const capabilities = await ensureSchemaCapabilities(supabase)

  if (!capabilities.hasSortOrder) {
    return projects.map((item, index) => ({ ...item, sortOrder: index }))
  }

  const updates = projects.map((project, index) => {
    return supabase
      .from(projectsTable)
      .update({ sort_order: index })
      .eq('id', project.id)
  })

  const results = await Promise.all(updates)
  const failed = results.find((result) => result.error)

  if (failed?.error) {
    throw toApiError(failed.error, 'Unable to reorder projects.')
  }

  invalidateProjectsCache()
  return projects.map((item, index) => ({ ...item, sortOrder: index }))
}
