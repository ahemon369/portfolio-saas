import { useCallback, useEffect, useRef, useState } from 'react'
import { getProjects } from '../services/api'

function normalizeProjects(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.projects)) {
    return data.projects
  }

  return []
}

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const mountedRef = useRef(true)

  const loadProjects = useCallback(async (options = {}) => {
    try {
      if (mountedRef.current) {
        setLoading(true)
        setError('')
      }

      const data = await getProjects({ force: Boolean(options.force) })

      if (mountedRef.current) {
        setProjects(normalizeProjects(data))
      }
    } catch (error) {
      if (mountedRef.current) {
        setError(error.message ?? 'Unable to load projects right now. Please try again shortly.')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    loadProjects()

    return () => {
      mountedRef.current = false
    }
  }, [loadProjects])

  const refetch = useCallback(() => loadProjects({ force: true }), [loadProjects])

  return { projects, loading, error, refetch }
}
