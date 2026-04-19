import { memo } from 'react'
import { motion } from 'framer-motion'
import { Code2, ExternalLink, FolderSearch } from 'lucide-react'
import { useProjects } from '../../hooks/useProjects'
import { fadeInUp, viewportConfig } from '../../lib/motion'
import { SectionHeader } from '../shared/SectionHeader'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const FALLBACK_PROJECT_IMAGE = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1280&q=80'

function ProjectSkeleton() {
  return (
    <Card className="overflow-hidden bg-slate-900/50">
      <Skeleton className="h-44 w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="gap-3">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </CardFooter>
    </Card>
  )
}

function projectImage(project) {
  return project.imageUrl ?? project.image ?? project.thumbnail ?? FALLBACK_PROJECT_IMAGE
}

function projectTechStack(project) {
  if (Array.isArray(project.tech)) return project.tech
  if (typeof project.tech === 'string') return project.tech.split(',').map((item) => item.trim()).filter(Boolean)
  if (Array.isArray(project.tech_stack)) return project.tech_stack
  if (typeof project.tech_stack === 'string') return project.tech_stack.split(',').map((item) => item.trim()).filter(Boolean)
  if (Array.isArray(project.techStack)) return project.techStack
  if (Array.isArray(project.stack)) return project.stack
  if (Array.isArray(project.technologies)) return project.technologies
  return []
}

function projectLiveLink(project) {
  return project.live ?? project.liveLink ?? project.live_url ?? project.demo_url ?? project.website ?? ''
}

function projectGithubLink(project) {
  return project.github ?? project.githubLink ?? project.github_url ?? project.repo_url ?? ''
}

const ProjectCard = memo(function ProjectCard({ project, index }) {
  const liveLink = projectLiveLink(project)
  const githubLink = projectGithubLink(project)

  return (
    <motion.article
      key={project.id ?? project.title ?? index}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -10, rotateX: 3, rotateY: -3 }}
      style={{ transformPerspective: 900 }}
    >
      <div className="group relative h-full rounded-2xl bg-gradient-to-br from-cyan-300/24 via-sky-300/8 to-indigo-300/24 p-[1px] transition-all duration-500 hover:from-cyan-300/42 hover:to-indigo-300/38">
        <Card className="premium-hover h-full overflow-hidden border-transparent bg-slate-900/55 hover:shadow-[0_18px_36px_rgba(8,18,46,0.55)]">
          <div className="relative h-44 overflow-hidden">
            <img
              src={projectImage(project)}
              alt={project.title ?? 'Project preview'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = FALLBACK_PROJECT_IMAGE
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-300/15 to-indigo-300/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </div>

          <CardHeader>
            <CardTitle>{project.title ?? 'Untitled Project'}</CardTitle>
            <CardDescription>
              {project.description ?? 'No description available for this project yet.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {projectTechStack(project).slice(0, 6).map((tech) => (
                <Badge key={`${project.title}-${tech}`} variant="muted">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="mt-auto gap-3">
            {liveLink ? (
              <Button asChild size="sm">
                <a href={liveLink} target="_blank" rel="noreferrer">
                  Live <ExternalLink size={14} />
                </a>
              </Button>
            ) : null}

            {githubLink ? (
              <Button asChild size="sm" variant="outline">
                <a href={githubLink} target="_blank" rel="noreferrer">
                  GitHub <Code2 size={14} />
                </a>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </motion.article>
  )
})

export function ProjectsSection() {
  const { projects, loading, error, refetch } = useProjects()

  return (
    <section id="projects" className="section-shell">
      <SectionHeader
        eyebrow="Projects"
        title="Selected Work"
        description="Projects are loaded from Supabase with graceful loading and error states for production robustness."
      />

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectSkeleton key={`sk-${index}`} />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="rounded-2xl border border-rose-300/30 bg-rose-900/20 p-5 text-sm text-rose-100">
          <p>{error}</p>
          <Button variant="secondary" className="mt-4" onClick={refetch}>
            Try Again
          </Button>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, index) => (
            <ProjectCard key={project.id ?? project.title ?? index} project={project} index={index} />
          ))}
        </div>
      ) : null}

      {!loading && !error && projects.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/40 p-6 text-sm text-slate-300">
          <div className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-28 w-28 rounded-full bg-cyan-300/12 blur-3xl" />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/35 bg-cyan-300/12 text-cyan-100">
            <FolderSearch className="h-5 w-5" />
          </span>
          <p className="mt-3 text-slate-200">No projects found in Supabase yet.</p>
          <p className="mt-1 text-slate-300/90">Add your first project from admin and it will appear here automatically.</p>
        </div>
      ) : null}
    </section>
  )
}
