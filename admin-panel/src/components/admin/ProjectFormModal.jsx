import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

function toFormState(project) {
  if (!project) {
    return {
      title: '',
      description: '',
      techStack: '',
      githubUrl: '',
      liveUrl: '',
      imagePath: '',
      status: 'draft',
    }
  }

  return {
    title: project.title ?? '',
    description: project.description ?? '',
    techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
    githubUrl: project.githubUrl ?? '',
    liveUrl: project.liveUrl ?? '',
    imagePath: project.imagePath ?? '',
    status: project.status === 'draft' ? 'draft' : 'published',
  }
}

export function ProjectFormModal({ open, saving, project, onClose, onSubmit }) {
  const [form, setForm] = useState(toFormState(project))
  const [imageFile, setImageFile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(toFormState(project))
    setImageFile(null)
    setError('')
  }, [open, project])

  const previewUrl = useMemo(() => {
    if (!imageFile) return project?.imageUrl ?? ''
    return URL.createObjectURL(imageFile)
  }, [imageFile, project?.imageUrl])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    if (!form.description.trim()) {
      setError('Description is required.')
      return
    }

    setError('')
    onSubmit(form, imageFile)
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={saving ? undefined : onClose}>
          <motion.form className="glass modal" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            <div className="modal-head">
              <h3>{project ? 'Edit Project' : 'Add Project'}</h3>
              <button className="btn-icon" type="button" onClick={onClose} disabled={saving}>
                <X size={16} />
              </button>
            </div>

            <div className="field-grid">
              <label>
                Title
                <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} disabled={saving} />
              </label>
              <label>
                Tech stack (comma separated)
                <input value={form.techStack} onChange={(event) => setForm((prev) => ({ ...prev, techStack: event.target.value }))} disabled={saving} />
              </label>
              <label className="full">
                Description
                <textarea rows={5} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} disabled={saving} />
              </label>
              <label>
                GitHub URL
                <input value={form.githubUrl} onChange={(event) => setForm((prev) => ({ ...prev, githubUrl: event.target.value }))} disabled={saving} />
              </label>
              <label>
                Live URL
                <input value={form.liveUrl} onChange={(event) => setForm((prev) => ({ ...prev, liveUrl: event.target.value }))} disabled={saving} />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))} disabled={saving}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="full">
                Project image
                <input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} disabled={saving} />
              </label>
            </div>

            {previewUrl ? <img className="preview" src={previewUrl} alt="Project preview" /> : null}
            {error ? <p className="error-text">{error}</p> : null}

            <div className="modal-actions">
              <button className="btn btn-outline" type="button" disabled={saving} onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving...' : project ? 'Update project' : 'Create project'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
