import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { JobCard } from '../components/JobCard'
import { useSavedJobs } from '../hooks/useSavedJobs'
import type { Job } from '../types/job'
import '../pages/HomePage.css'

export function SavedJobsPage() {
  const { savedIds, isSaved, toggleSaved } = useSavedJobs()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (savedIds.length === 0) {
      setJobs([])
      setLoading(false)
      return
    }
    setLoading(true)
    api.getJobsByIds(savedIds).then((results) => {
      setJobs(results.filter((job): job is Job => job !== null))
      setLoading(false)
    })
  }, [savedIds])

  return (
    <div className="home-page">
      <section className="hero cork-texture">
        <div className="container hero__inner">
          <p className="hero__eyebrow">Your board</p>
          <h1 className="hero__title">Saved jobs</h1>
          <p className="hero__subtitle">
            Everything you've pinned for later, kept right here on this device.
          </p>
        </div>
      </section>

      <section className="board cork-texture" style={{ paddingTop: 40 }}>
        <div className="container">
          {loading && <p style={{ color: 'var(--color-paper)' }}>Loading your pins…</p>}

          {!loading && jobs.length === 0 && (
            <EmptyState
              title="Nothing pinned yet"
              message="Tap the star on any listing to save it here for later."
            />
          )}

          {!loading && jobs.length > 0 && (
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
          )}
        </div>
      </section>
    </div>
  )
}
