import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { useSavedJobs } from '../hooks/useSavedJobs'
import type { ApplicationFormValues, Job } from '../types/job'
import { JOB_TYPE_LABELS, REMOTE_TYPE_LABELS } from '../types/job'
import { formatPostedAgo, formatSalary } from '../utils/format'
import './JobDetailPage.css'

const EMPTY_APPLICATION: ApplicationFormValues = {
  applicantName: '',
  applicantEmail: '',
  resumeUrl: '',
  coverLetter: '',
}

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSaved, toggleSaved } = useSavedJobs()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState<ApplicationFormValues>(EMPTY_APPLICATION)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .getJob(id)
      .then(setJob)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleApply(event: React.FormEvent) {
    event.preventDefault()
    if (!job) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await api.applyToJob(job.id, form)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        setSubmitError(Object.values(err.details)[0] || err.message)
      } else {
        setSubmitError('Could not send your application right now. Please try again shortly.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="container job-detail__loading">Loading listing…</div>
  }

  if (notFound || !job) {
    return (
      <div className="container job-detail__notfound">
        <h2>This pin has fallen off the board</h2>
        <p>We couldn't find that job listing. It may have been removed or filled.</p>
        <button type="button" onClick={() => navigate('/')}>
          ← Back to all jobs
        </button>
      </div>
    )
  }

  return (
    <div className="job-detail cork-texture">
      <div className="container job-detail__grid">
        <article className="job-detail__main">
          <Link to="/" className="job-detail__back">
            ← Back to the board
          </Link>

          <header className="job-detail__header">
            <div>
              <h1>{job.title}</h1>
              <p className="job-detail__company">{job.company}</p>
            </div>
            <button
              type="button"
              className={`save-button save-button--large ${isSaved(job.id) ? 'save-button--active' : ''}`}
              onClick={() => toggleSaved(job.id)}
              aria-pressed={isSaved(job.id)}
            >
              {isSaved(job.id) ? '★ Saved' : '☆ Save job'}
            </button>
          </header>

          <div className="job-detail__meta">
            <span>{job.location}</span>
            <span>•</span>
            <span>{REMOTE_TYPE_LABELS[job.remoteType]}</span>
            <span>•</span>
            <span>{JOB_TYPE_LABELS[job.jobType]}</span>
            <span>•</span>
            <span>{job.category}</span>
          </div>

          <p className="job-detail__salary">{formatSalary(job)}</p>
          <p className="job-detail__posted">Posted {formatPostedAgo(job.postedAt)}</p>

          {job.status === 'CLOSED' && (
            <p className="job-detail__closed-banner">
              This role is no longer accepting applications.
            </p>
          )}

          <section>
            <h2>About this role</h2>
            <p className="job-detail__body">{job.description}</p>
          </section>

          {job.requirements && (
            <section>
              <h2>What they're looking for</h2>
              <p className="job-detail__body">{job.requirements}</p>
            </section>
          )}
        </article>

        <aside className="job-detail__apply">
          {job.status === 'CLOSED' ? (
            <div className="apply-card">
              <h2>Applications closed</h2>
              <p>This posting is no longer accepting new applicants.</p>
            </div>
          ) : job.applyUrl ? (
            <div className="apply-card">
              <h2>Ready to apply?</h2>
              <p>This employer handles applications on their own site.</p>
              <a className="apply-card__submit" href={job.applyUrl} target="_blank" rel="noreferrer">
                Apply on company site ↗
              </a>
            </div>
          ) : submitted ? (
            <div className="apply-card apply-card--success">
              <h2>Application sent!</h2>
              <p>
                {job.company} has received your application{job.applyEmail ? ` at ${job.applyEmail}` : ''}.
                Good luck!
              </p>
            </div>
          ) : (
            <form className="apply-card" onSubmit={handleApply}>
              <h2>Apply for this role</h2>
              <label>
                Full name
                <input
                  required
                  type="text"
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.applicantEmail}
                  onChange={(e) => setForm({ ...form, applicantEmail: e.target.value })}
                />
              </label>
              <label>
                Resume link
                <input
                  required
                  type="url"
                  placeholder="https://…"
                  value={form.resumeUrl}
                  onChange={(e) => setForm({ ...form, resumeUrl: e.target.value })}
                />
              </label>
              <label>
                Cover letter <span className="apply-card__optional">(optional)</span>
                <textarea
                  rows={4}
                  value={form.coverLetter}
                  onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
                />
              </label>

              {submitError && <p className="apply-card__error">{submitError}</p>}

              <button type="submit" className="apply-card__submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit application'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  )
}
