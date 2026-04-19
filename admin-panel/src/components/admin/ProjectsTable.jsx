import { motion } from 'framer-motion'
import { ArrowDownUp, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export function ProjectsTable({ projects, busy, onEdit, onDelete, onToggleStatus, onReorder, onTrackProjectClick }) {
  const [draggedId, setDraggedId] = useState(null)

  const handleDrop = (targetProjectId) => {
    if (!draggedId || draggedId === targetProjectId) {
      setDraggedId(null)
      return
    }

    onReorder(draggedId, targetProjectId)
    setDraggedId(null)
  }

  return (
    <div className="glass card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Tech</th>
            <th>Links</th>
            <th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project, index) => (
            <motion.tr
              key={project.id ?? `${project.title}-${index}`}
              draggable={!busy}
              onDragStart={() => setDraggedId(project.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(project.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <td>
                <div className="project-cell">
                  {project.imageUrl ? <img src={project.imageUrl} alt={project.title} loading="lazy" decoding="async" /> : <span className="img-fallback" />}
                  <div>
                    <strong>
                      <ArrowDownUp size={13} /> {project.title}
                    </strong>
                    <p>{project.description}</p>
                  </div>
                </div>
              </td>
              <td>
                <span className={`status-badge ${project.status === 'draft' ? 'status-draft' : 'status-published'}`}>
                  {project.status === 'draft' ? 'Draft' : 'Published'}
                </span>
              </td>
              <td>{(project.techStack ?? []).slice(0, 5).join(', ') || '-'}</td>
              <td>
                <div className="links">
                  {project.liveUrl ? (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" onClick={() => onTrackProjectClick(project, 'live')}>
                      Live
                    </a>
                  ) : null}
                  {project.githubUrl ? (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" onClick={() => onTrackProjectClick(project, 'github')}>
                      GitHub
                    </a>
                  ) : null}
                  {!project.liveUrl && !project.githubUrl ? <span>-</span> : null}
                </div>
              </td>
              <td className="right">
                <button className="btn btn-outline" type="button" disabled={busy} onClick={() => onToggleStatus(project)}>
                  {project.status === 'draft' ? <Eye size={14} /> : <EyeOff size={14} />}
                  {project.status === 'draft' ? 'Publish' : 'Unpublish'}
                </button>
                <button className="btn btn-outline" type="button" disabled={busy} onClick={() => onEdit(project)}>
                  <Pencil size={14} /> Edit
                </button>
                <button className="btn btn-danger" type="button" disabled={busy} onClick={() => onDelete(project)}>
                  <Trash2 size={14} /> Delete
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
