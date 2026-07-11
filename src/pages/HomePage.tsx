import { useCallback, useEffect, useState } from 'react'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { JobCard } from '../components/JobCard'
import { Pagination } from '../components/Pagination'
import { SearchFilters } from '../components/SearchFilters'
import { useSavedJobs } from '../hooks/useSavedJobs'
import type { Job, JobFilters } from '../types/job'
import './HomePage.css'

const EMPTY_FILTERS: JobFilters = {
  search: '',
  location: '',
  category: '',
  jobType: '',
  remoteType: '',
}

const PAGE_SIZE = 9

export function HomePage() {
  const [filters, setFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<JobFilters>(EMPTY_FILTERS)
  const [categories, setCategories] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isSaved, toggleSaved } = useSavedJobs()

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]))
  }, [])

  const loadJobs = useCallback(async (currentFilters: JobFilters, currentPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.listJobs({
        search: currentFilters.search,
        location: currentFilters.location,
        category: currentFilters.category,
        jobType: currentFilters.jobType || undefined,
        remoteType: currentFilters.remoteType || undefined,
        status: 'OPEN',
        page: currentPage,
        size: PAGE_SIZE,
      })
      setJobs(response.items)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError('The board is stuck. Could not load jobs — please try again in a moment.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadJobs(appliedFilters, page)
  }, [appliedFilters, page, loadJobs])

  function handleSearchSubmit() {
    setPage(0)
    setAppliedFilters(filters)
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setPage(0)
  }

  return (
    <div className="home-page">
      <section className="hero cork-texture">
        <div className="container hero__inner">
          <p className="hero__eyebrow">Fresh listings, pinned daily</p>
          <h1 className="hero__title">Find work worth pinning.</h1>
          <p className="hero__subtitle">
            Real roles from real teams — browse the board, save what catches your eye, and apply
            in minutes.
          </p>
        </div>
      </section>

      <div className="container">
        <SearchFilters
          filters={filters}
          categories={categories}
          onChange={setFilters}
          onSubmit={handleSearchSubmit}
          resultCount={loading ? undefined : totalElements}
        />
      </div>

      <section className="board cork-texture">
        <div className="container">
          {loading && (
            <div className="board__grid" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="job-card-skeleton" aria-hidden="true" />
              ))}
            </div>
          )}

          {!loading && error && (
            <EmptyState title="Something came loose" message={error} actionLabel="Try again" onAction={() => loadJobs(appliedFilters, page)} />
          )}

          {!loading && !error && jobs.length === 0 && (
            <EmptyState
              title="No pins match that search"
              message="Try a broader search, clear your filters, or check back soon — new roles get pinned often."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          )}

          {!loading && !error && jobs.length > 0 && (
            <>
              <div className="board__grid">
                {jobs.map((job, index) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    isSaved={isSaved(job.id)}
                    onToggleSave={toggleSaved}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </section>
    </div>
  )
}
