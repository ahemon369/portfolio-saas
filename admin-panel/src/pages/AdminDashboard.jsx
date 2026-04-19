import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { AdminLayout } from '../components/admin/AdminLayout'
import { ProjectFormModal } from '../components/admin/ProjectFormModal'
import { ProjectsTable } from '../components/admin/ProjectsTable'
import { useAdminAuth } from '../context/adminAuth'
import { useToast } from '../context/ToastContext'
import { trackAdminEvent } from '../lib/analytics'
import {
  createProject,
  deleteProject,
  listProjects,
  reorderProjects,
  updateProject,
  uploadProjectImage,
} from '../services/api'

function toOptimisticProject(values, imageUrl, id) {
  return {
    id,
    title: values.title.trim(),
    description: values.description.trim(),
    techStack: String(values.techStack ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    githubUrl: values.githubUrl?.trim() ?? '',
    liveUrl: values.liveUrl?.trim() ?? '',
    imagePath: values.imagePath ?? '',
    imageUrl: imageUrl ?? '',
    status: values.status === 'draft' ? 'draft' : 'published',
    sortOrder: Number(values.sortOrder ?? 0),
  }
}

function isAuthFailure(message) {
  const normalized = String(message ?? '').toLowerCase()
  return normalized.includes('session expired') || normalized.includes('unauthorized') || normalized.includes('jwt')
}

export default function AdminDashboard() {
  const { user, logout, sessionWarning } = useAdminAuth()
  const { pushToast } = useToast()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeProject, setActiveProject] = useState(null)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const pageSize = 8

  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await listProjects({ force: true })
      setProjects(data)
      setPage(1)
      if (data.length > 0) {
        pushToast('info', 'Projects synced.')
      }
    } catch (loadError) {
      const message = loadError.message ?? 'Unable to load projects.'
      setError(message)
      pushToast('error', message)

      if (isAuthFailure(message)) {
        await logout().catch(() => {})
      }
    } finally {
      setLoading(false)
    }
  }, [pushToast, logout])

  useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  useEffect(() => {
    trackAdminEvent('dashboard_view', {
      scope: 'dashboard',
    }).catch(() => {})
  }, [])

  const stats = useMemo(
    () => ({
      total: projects.length,
      withLive: projects.filter((item) => item.liveUrl).length,
      withRepo: projects.filter((item) => item.githubUrl).length,
      published: projects.filter((item) => item.status !== 'draft').length,
      drafts: projects.filter((item) => item.status === 'draft').length,
    }),
    [projects],
  )

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const statusMatches = statusFilter === 'all' ? true : (project.status ?? 'published') === statusFilter
      const searchMatches =
        !normalizedSearch ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch)

      return statusMatches && searchMatches
    })
  }, [projects, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize))

  const pagedProjects = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredProjects.slice(start, start + pageSize)
  }, [filteredProjects, page])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const onCreate = () => {
    setActiveProject(null)
    setModalOpen(true)
  }

  const onEdit = (project) => {
    setActiveProject(project)
    setModalOpen(true)
  }

  const onToggleStatus = async (project) => {
    const nextStatus = project.status === 'draft' ? 'published' : 'draft'
    const previous = [...projects]

    setProjects((prev) => prev.map((item) => (item.id === project.id ? { ...item, status: nextStatus } : item)))

    try {
      const updated = await updateProject(project.id, {
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        imagePath: project.imagePath,
        status: nextStatus,
      })

      setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
      pushToast('success', `Project ${nextStatus === 'published' ? 'published' : 'moved to draft'}.`)
    } catch (statusError) {
      setProjects(previous)
      const message = statusError.message ?? 'Unable to update status.'
      pushToast('error', message)
      if (isAuthFailure(message)) {
        await logout().catch(() => {})
      }
    }
  }

  const onReorder = async (sourceId, targetId) => {
    if (sourceId === targetId) return

    const previous = [...projects]
    const sourceIndex = previous.findIndex((item) => item.id === sourceId)
    const targetIndex = previous.findIndex((item) => item.id === targetId)

    if (sourceIndex < 0 || targetIndex < 0) {
      return
    }

    const reordered = [...previous]
    const [moved] = reordered.splice(sourceIndex, 1)
    reordered.splice(targetIndex, 0, moved)
    setProjects(reordered)

    try {
      const persisted = await reorderProjects(reordered)
      setProjects(persisted)
      pushToast('success', 'Project order updated.')
    } catch (reorderError) {
      setProjects(previous)
      const message = reorderError.message ?? 'Unable to reorder projects.'
      pushToast('error', message)
    }
  }

  const onTrackProjectClick = (project, source) => {
    trackAdminEvent('project_click', {
      projectId: project.id,
      source,
    }).catch(() => {})
  }

  const onRequestDelete = (project) => {
    if (saving || deletingId) {
      return
    }

    setProjectToDelete(project)
  }

  const onConfirmDelete = async () => {
    const project = projectToDelete
    if (!project) return

    const currentIndex = projects.findIndex((item) => item.id === project.id)
    if (currentIndex === -1) return

    const snapshot = projects[currentIndex]
    setDeletingId(project.id)
    setProjectToDelete(null)
    setProjects((prev) => prev.filter((item) => item.id !== project.id))

    try {
      await deleteProject(project.id)
      pushToast('success', 'Project deleted.')
    } catch (deleteError) {
      setProjects((prev) => {
        const copy = [...prev]
        copy.splice(currentIndex, 0, snapshot)
        return copy
      })
      const message = deleteError.message ?? 'Unable to delete project.'
      setError(message)
      pushToast('error', message)

      if (isAuthFailure(message)) {
        await logout().catch(() => {})
      }
    } finally {
      setDeletingId(null)
    }
  }

  const onCancelDelete = () => {
    if (deletingId) return
    setProjectToDelete(null)
  }

  const onSave = async (formValues, imageFile) => {
    const tempId = `temp-${Date.now()}`

    let imagePath = formValues.imagePath
    let uploadedPreviewUrl = activeProject?.imageUrl ?? ''

    try {
      setSaving(true)
      setError('')

      if (imageFile) {
        const uploaded = await uploadProjectImage(imageFile, formValues.title)
        imagePath = uploaded.path
        uploadedPreviewUrl = uploaded.publicUrl
      }

      const payload = {
        ...formValues,
        imagePath,
      }

      if (!activeProject) {
        const optimistic = toOptimisticProject(payload, uploadedPreviewUrl, tempId)
        setProjects((prev) => [optimistic, ...prev])

        const created = await createProject(payload)
        setProjects((prev) => prev.map((item) => (item.id === tempId ? created : item)))
        pushToast('success', 'Project created.')
      } else {
        const previous = [...projects]
        const optimistic = toOptimisticProject(payload, uploadedPreviewUrl || activeProject.imageUrl, activeProject.id)

        setProjects((prev) => prev.map((item) => (item.id === activeProject.id ? { ...item, ...optimistic } : item)))

        try {
          const updated = await updateProject(activeProject.id, payload)
          setProjects((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
          pushToast('success', 'Project updated.')
        } catch (updateError) {
          setProjects(previous)
          throw updateError
        }
      }

      setModalOpen(false)
      setActiveProject(null)
    } catch (saveError) {
      setProjects((prev) => prev.filter((item) => item.id !== tempId))
      const message = saveError.message ?? 'Unable to save project.'
      setError(message)
      pushToast('error', message)

      if (isAuthFailure(message)) {
        await logout().catch(() => {})
      }
    } finally {
      setSaving(false)
    }
  }

  const onLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
      pushToast('info', 'Logged out.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <AdminLayout userEmail={user?.email} onLogout={onLogout} loggingOut={loggingOut} sessionWarning={sessionWarning}>
      <section className="stats-grid">
        <div className="glass card stat">
          <p>Total Projects</p>
          <strong>{stats.total}</strong>
        </div>
        <div className="glass card stat">
          <p>With Live Link</p>
          <strong>{stats.withLive}</strong>
        </div>
        <div className="glass card stat">
          <p>With GitHub Link</p>
          <strong>{stats.withRepo}</strong>
        </div>
        <div className="glass card stat">
          <p>Published</p>
          <strong>{stats.published}</strong>
        </div>
        <div className="glass card stat">
          <p>Drafts</p>
          <strong>{stats.drafts}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Projects</h2>
          <div className="panel-actions">
            <input
              className="search-input"
              value={searchTerm}
              placeholder="Search projects"
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setPage(1)
              }}
              disabled={saving || loading || Boolean(deletingId)}
            />
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              disabled={saving || loading || Boolean(deletingId)}
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button className="btn btn-primary" type="button" disabled={saving || loading || Boolean(deletingId)} onClick={onCreate}>
            <Plus size={15} /> Add Project
          </button>
        </div>

        {loading ? (
          <div className="glass card skeleton-wrap">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        ) : error ? (
          <div className="glass card error">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <motion.div className="glass card placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            No projects yet. Create your first project.
          </motion.div>
        ) : (
          <>
            <ProjectsTable
              projects={pagedProjects}
              busy={saving || loading || Boolean(deletingId)}
              onEdit={onEdit}
              onDelete={onRequestDelete}
              onToggleStatus={onToggleStatus}
              onReorder={onReorder}
              onTrackProjectClick={onTrackProjectClick}
            />

            <div className="pagination-row">
              <button className="btn btn-outline" type="button" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-outline" type="button" disabled={page >= totalPages} onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}>
                Next
              </button>
            </div>
          </>
        )}
      </section>

      <ProjectFormModal open={modalOpen} saving={saving} project={activeProject} onClose={() => (!saving ? setModalOpen(false) : null)} onSubmit={onSave} />

      {projectToDelete ? (
        <div className="modal-backdrop" onClick={onCancelDelete}>
          <div className="glass modal confirm-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <h3>Delete Project</h3>
            </div>
            <p>
              Delete <strong>{projectToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-outline" type="button" onClick={onCancelDelete} disabled={Boolean(deletingId)}>
                Cancel
              </button>
              <button className="btn btn-danger" type="button" onClick={onConfirmDelete} disabled={Boolean(deletingId)}>
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  )
}
