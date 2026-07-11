import type { FormEvent } from 'react'
import type { JobFilters, JobType, RemoteType } from '../types/job'
import { JOB_TYPE_LABELS, REMOTE_TYPE_LABELS } from '../types/job'
import './SearchFilters.css'

interface SearchFiltersProps {
  filters: JobFilters
  categories: string[]
  onChange: (filters: JobFilters) => void
  onSubmit: () => void
  resultCount?: number
}

export function SearchFilters({ filters, categories, onChange, onSubmit, resultCount }: SearchFiltersProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit()
  }

  function update<K extends keyof JobFilters>(key: K, value: JobFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <form className="search-card" onSubmit={handleSubmit} role="search" aria-label="Search jobs">
      <div className="search-card__row search-card__row--main">
        <label className="visually-hidden" htmlFor="search-input">
          Search by title, company, or keyword
        </label>
        <input
          id="search-input"
          type="text"
          placeholder="Search titles, companies, keywords…"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
        />
        <button type="submit" className="search-card__submit">
          Find jobs
        </button>
      </div>

      <div className="search-card__row search-card__row--filters">
        <label>
          <span className="visually-hidden">Location</span>
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={(e) => update('location', e.target.value)}
          />
        </label>

        <label>
          <span className="visually-hidden">Category</span>
          <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="visually-hidden">Job type</span>
          <select
            value={filters.jobType}
            onChange={(e) => update('jobType', e.target.value as JobType | '')}
          >
            <option value="">Any job type</option>
            {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((type) => (
              <option key={type} value={type}>
                {JOB_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="visually-hidden">Work style</span>
          <select
            value={filters.remoteType}
            onChange={(e) => update('remoteType', e.target.value as RemoteType | '')}
          >
            <option value="">Any work style</option>
            {(Object.keys(REMOTE_TYPE_LABELS) as RemoteType[]).map((type) => (
              <option key={type} value={type}>
                {REMOTE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {resultCount !== undefined && (
        <p className="search-card__count" aria-live="polite">
          {resultCount} {resultCount === 1 ? 'job' : 'jobs'} pinned right now
        </p>
      )}
    </form>
  )
}
