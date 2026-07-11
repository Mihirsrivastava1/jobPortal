import { Link } from 'react-router-dom'
import type { Job } from '../types/job'
import { JOB_TYPE_LABELS, REMOTE_TYPE_LABELS } from '../types/job'
import { formatPostedAgo, formatSalary, isClosingSoon, isNew } from '../utils/format'
import './JobCard.css'

interface JobCardProps {
  job: Job
  index: number
  isSaved: boolean
  onToggleSave: (id: number) => void
}

export function JobCard({ job, index, isSaved, onToggleSave }: JobCardProps) {
  const rotation = index % 2 === 0 ? -1.4 : 1.1
  const closingSoon = isClosingSoon(job.closingDate)
  const fresh = isNew(job.postedAt)

  return (
    <article
      className={`job-card ${job.status === 'CLOSED' ? 'job-card--closed' : ''}`}
      style={{ '--rotate': `${rotation}deg` } as React.CSSProperties}
    >
      <span className="job-card__pin" aria-hidden="true" />
      {closingSoon && job.status === 'OPEN' && (
        <span className="job-card__tape" aria-hidden="true">
          closing soon
        </span>
      )}
      {fresh && job.status === 'OPEN' && <span className="job-card__new">new!</span>}

      <Link to={`/jobs/${job.id}`} className="job-card__link">
        <header className="job-card__header">
          <h3 className="job-card__title">{job.title}</h3>
          <p className="job-card__company">{job.company}</p>
        </header>

        <div className="job-card__meta">
          <span>{job.location}</span>
          <span className="job-card__dot" aria-hidden="true">•</span>
          <span>{REMOTE_TYPE_LABELS[job.remoteType]}</span>
        </div>

        <div className="job-card__tags">
          <span className="tag">{JOB_TYPE_LABELS[job.jobType]}</span>
          <span className="tag tag--muted">{job.category}</span>
        </div>

        <p className="job-card__salary">{formatSalary(job)}</p>
      </Link>

      <footer className="job-card__footer">
        <span className="job-card__posted">{formatPostedAgo(job.postedAt)}</span>
        <button
          type="button"
          className={`save-button ${isSaved ? 'save-button--active' : ''}`}
          onClick={() => onToggleSave(job.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
        >
          {isSaved ? '★ Saved' : '☆ Save'}
        </button>
      </footer>

      {job.status === 'CLOSED' && <span className="job-card__stamp">Filled</span>}
    </article>
  )
}
