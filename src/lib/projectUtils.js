export const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1280&q=80'

const PROJECT_IMAGE_FIELDS = ['image', 'image_url', 'thumbnail', 'image_path', 'storage_path', 'cover_path']

export function sanitizeText(value, maxLength = 4000) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function normalizeTechStack(value) {
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

export function sanitizeUrlOrNull(value, fieldLabel) {
  const normalized = sanitizeText(value, 500)
  if (!normalized) return null

  let parsed
  try {
    parsed = new URL(normalized)
  } catch {
    throw new Error(`${fieldLabel} must be a valid URL.`)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`${fieldLabel} must start with http:// or https://.`)
  }

  return parsed.toString()
}

export function isAbsoluteHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value)
}

function appendImageParams(url, options = {}) {
  try {
    const parsedUrl = new URL(url)
    if (options.width) parsedUrl.searchParams.set('width', String(options.width))
    if (options.height) parsedUrl.searchParams.set('height', String(options.height))
    if (options.quality) parsedUrl.searchParams.set('quality', String(options.quality))
    parsedUrl.searchParams.set('format', options.format ?? 'webp')
    return parsedUrl.toString()
  } catch {
    return url
  }
}

export function toSafeFileSlug(value) {
  return sanitizeText(value, 80)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function resolveProjectImageUrl(project, supabase, defaultBucket, options = {}) {
  const rawValue = PROJECT_IMAGE_FIELDS
    .map((field) => project[field])
    .find((fieldValue) => typeof fieldValue === 'string' && fieldValue.trim())

  if (!rawValue) {
    return FALLBACK_PROJECT_IMAGE
  }

  if (isAbsoluteHttpUrl(rawValue)) {
    return appendImageParams(rawValue, options)
  }

  const bucket = sanitizeText(project.image_bucket ?? defaultBucket, 120) || defaultBucket
  const storagePath = rawValue.replace(/^\/+/, '')
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath, {
    transform: {
      width: options.width,
      height: options.height,
      quality: options.quality,
      format: options.format ?? 'origin',
    },
  })

  return data?.publicUrl ?? FALLBACK_PROJECT_IMAGE
}

export function normalizeProjectRecord(project, supabase, defaultBucket) {
  const title = sanitizeText(project.title, 180)
  const description = sanitizeText(project.description, 4000)
  const tech = normalizeTechStack(project.tech ?? project.tech_stack ?? project.techStack ?? project.stack)
  const github = sanitizeText(project.github ?? project.github_url ?? project.githubLink ?? project.repo_url, 500)
  const live = sanitizeText(project.live ?? project.live_url ?? project.liveLink ?? project.demo_url ?? project.website, 500)
  const image = sanitizeText(project.image ?? project.image_path ?? project.image_url, 500)

  return {
    ...project,
    title,
    description,
    tech,
    github,
    live,
    image,
    createdAt: project.created_at ?? null,
    imageUrl: resolveProjectImageUrl(project, supabase, defaultBucket, {
      width: 1280,
      quality: 80,
      format: 'origin',
    }),
    imageThumbUrl: resolveProjectImageUrl(project, supabase, defaultBucket, {
      width: 420,
      height: 280,
      quality: 72,
      format: 'origin',
    }),
    techStack: tech,
    githubLink: github,
    liveLink: live,
  }
}
