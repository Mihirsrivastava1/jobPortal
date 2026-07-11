import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import type { JobFormValues, JobType, RemoteType } from '../types/job'
import { JOB_TYPE_LABELS, REMOTE_TYPE_LABELS } from '../types/job'
import './PostJobPage.css'

const EMPTY_FORM: JobFormValues = {
  title: '',
  company: '',
  companyLogoUrl: '',
  location: '',
  remoteType: 'REMOTE',
  jobType: 'FULL_TIME',
  category: '',
  salaryMin: '',
  salaryMax: '',
  currency: 'USD',
  description: '',
  requirements: '',
  applyUrl: '',
  applyEmail: '',
  closingDate: '',
}

export function PostJobPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<JobFormValues>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function update<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setFieldErrors({})
    try {
      const created = await api.createJob(form)
      navigate(`/jobs/${created.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          setFieldErrors(err.details)
          setError('Please fix the highlighted fields.')
        } else {
          setError(err.message)
        }
      } else {
        setError('Something went wrong posting this job. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="post-job cork-texture">
      <div className="container post-job__inner">
        <header className="post-job__header">
          <h1>Pin a new job</h1>
          <p>Fill out the flyer below — it'll go live on the board the moment you submit it.</p>
        </header>

        <p className="post-job__local-notice">
          📌 This demo has no backend — new listings are saved right in your browser's local
          storage, so they'll show up on this device only (and reset if you clear site data).
        </p>

        <form className="post-job__form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>The basics</legend>
            <div className="post-job__row">
              <label>
                Job title
                <input required value={form.title} onChange={(e) => update('title', e.target.value)} />
                {fieldErrors.title && <span className="post-job__field-error">{fieldErrors.title}</span>}
              </label>
              <label>
                Company
                <input required value={form.company} onChange={(e) => update('company', e.target.value)} />
                {fieldErrors.company && <span className="post-job__field-error">{fieldErrors.company}</span>}
              </label>
            </div>
            <div className="post-job__row">
              <label>
                Location
                <input
                  required
                  placeholder="City, Country or 'Remote'"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
                {fieldErrors.location && <span className="post-job__field-error">{fieldErrors.location}</span>}
              </label>
              <label>
                Category
                <input
                  required
                  placeholder="Engineering, Design, Sales…"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                />
                {fieldErrors.category && <span className="post-job__field-error">{fieldErrors.category}</span>}
              </label>
            </div>
            <div className="post-job__row">
              <label>
                Work style
                <select value={form.remoteType} onChange={(e) => update('remoteType', e.target.value as RemoteType)}>
                  {(Object.keys(REMOTE_TYPE_LABELS) as RemoteType[]).map((type) => (
                    <option key={type} value={type}>
                      {REMOTE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Job type
                <select value={form.jobType} onChange={(e) => update('jobType', e.target.value as JobType)}>
                  {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((type) => (
                    <option key={type} value={type}>
                      {JOB_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Compensation (optional)</legend>
            <div className="post-job__row">
              <label>
                Min salary
                <input
                  type="number"
                  min={0}
                  value={form.salaryMin}
                  onChange={(e) => update('salaryMin', e.target.value)}
                />
              </label>
              <label>
                Max salary
                <input
                  type="number"
                  min={0}
                  value={form.salaryMax}
                  onChange={(e) => update('salaryMax', e.target.value)}
                />
              </label>
              <label>
                Currency
                <input
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend>Details</legend>
            <label>
              Description
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
              {fieldErrors.description && <span className="post-job__field-error">{fieldErrors.description}</span>}
            </label>
            <label>
              Requirements
              <textarea
                rows={4}
                value={form.requirements}
                onChange={(e) => update('requirements', e.target.value)}
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>How should candidates apply?</legend>
            <p className="post-job__hint">
              Leave both blank to collect applications directly on this site instead.
            </p>
            <div className="post-job__row">
              <label>
                External application URL
                <input
                  type="url"
                  placeholder="https://…"
                  value={form.applyUrl}
                  onChange={(e) => update('applyUrl', e.target.value)}
                />
              </label>
              <label>
                Contact email
                <input
                  type="email"
                  value={form.applyEmail}
                  onChange={(e) => update('applyEmail', e.target.value)}
                />
              </label>
            </div>
            <label>
              Applications close on
              <input
                type="date"
                value={form.closingDate}
                onChange={(e) => update('closingDate', e.target.value)}
              />
            </label>
          </fieldset>

          {error && <p className="post-job__error">{error}</p>}

          <button type="submit" className="post-job__submit" disabled={submitting}>
            {submitting ? 'Pinning…' : 'Pin this job to the board'}
          </button>
        </form>
      </div>
    </div>
  )
}
