import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { StoredApplication } from '../lib/store'
import type { Job } from '../types/job'
import { JOB_TYPE_LABELS } from '../types/job'
import { formatPostedAgo } from '../utils/format'
import './ManagePage.css'

export function ManagePage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null)
  const [applicants, setApplicants] = useState<StoredApplication[]>([])

  async function loadAll() {
    setLoading(true)
    const openPage = await api.listJobs({ status: 'OPEN', page: 0, size: 100 })
    const closedPage = await api.listJobs({ status: 'CLOSED', page: 0, size: 100 })
    const allJobs = [...openPage.items, ...closedPage.items].sort((a, b) =>
      a.postedAt < b.postedAt ? 1 : -1
    )
    setJobs(allJobs)

    const countEntries = await Promise.all(
      allJobs.map(async (job) => [job.id, await api.countApplications(job.id)] as const)
    )
    setCounts(Object.fromEntries(countEntries))
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function toggleStatus(job: Job) {
    if (job.status === 'OPEN') {
      await api.closeJob(job.id)
    } else {
      await api.reopenJob(job.id)
    }
    loadAll()
  }

  async function handleDelete(job: Job) {
    if (!window.confirm(`Delete "${job.title}" at ${job.company}? This can't be undone.`)) return
    await api.deleteJob(job.id)
    if (expandedJobId === job.id) setExpandedJobId(null)
    loadAll()
  }

  async function toggleApplicants(jobId: number) {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }
    const list = await api.listApplications(jobId)
    setApplicants(list)
    setExpandedJobId(jobId)
  }

  async function handleReset() {
    if (!window.confirm('Reset all listings and applications back to the original demo data?')) return
    await api.resetDemoData()
    setExpandedJobId(null)
    loadAll()
  }

  return (
    <div className="manage-page cork-texture">
      <div className="container manage-page__inner">
        <header className="manage-page__header">
          <div>
            <h1>Manage listings</h1>
            <p>Everything posted on this device — close, reopen, or remove a listing anytime.</p>
          </div>
          <button type="button" className="manage-page__reset" onClick={handleReset}>
            Reset demo data
          </button>
        </header>

        {loading && <p className="manage-page__loading">Loading listings…</p>}

        {!loading && jobs.length === 0 && (
          <p className="manage-page__empty">
            No listings yet. <Link to="/post">Post the first one →</Link>
          </p>
        )}

        {!loading && jobs.length > 0 && (
          <table className="manage-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Posted</th>
                <th>Applicants</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <Fragment key={job.id}>
                  <tr className={job.status === 'CLOSED' ? 'is-closed' : ''}>
                    <td>
                      <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                    </td>
                    <td>{job.company}</td>
                    <td>{JOB_TYPE_LABELS[job.jobType]}</td>
                    <td>
                      <span className={`status-pill status-pill--${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{formatPostedAgo(job.postedAt)}</td>
                    <td>
                      <button type="button" className="manage-table__link" onClick={() => toggleApplicants(job.id)}>
                        {counts[job.id] ?? 0} {expandedJobId === job.id ? '▲' : '▼'}
                      </button>
                    </td>
                    <td className="manage-table__actions">
                      <button type="button" onClick={() => toggleStatus(job)}>
                        {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                      </button>
                      <button type="button" className="manage-table__delete" onClick={() => handleDelete(job)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                  {expandedJobId === job.id && (
                    <tr className="manage-table__expanded">
                      <td colSpan={7}>
                        {applicants.length === 0 ? (
                          <p className="manage-table__no-applicants">No applications yet for this role.</p>
                        ) : (
                          <ul className="applicant-list">
                            {applicants.map((applicant) => (
                              <li key={applicant.id}>
                                <strong>{applicant.applicantName}</strong> — {applicant.applicantEmail}
                                {' · '}
                                <a href={applicant.resumeUrl} target="_blank" rel="noreferrer">
                                  resume
                                </a>
                                {' · '}
                                <span className="applicant-list__time">{formatPostedAgo(applicant.appliedAt)}</span>
                                {applicant.coverLetter && (
                                  <p className="applicant-list__cover">{applicant.coverLetter}</p>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
